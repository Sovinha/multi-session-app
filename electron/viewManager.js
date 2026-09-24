const { WebContentsView, BrowserView, session, app } = require('electron');
const path = require('path');

const AUTHENTIC_CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const FIREFOX_GOOGLE_AUTH_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0";

class ViewManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.views = new Map(); // cellId -> { view, partitionId, muted, url, title, createdAt }
    this.startStatsCollector();
  }

  startStatsCollector() {
    if (this.statsInterval) clearInterval(this.statsInterval);
    this.statsInterval = setInterval(() => {
      this.emitStats();
    }, 2000);
  }

  createView(cellId, partitionId = 'persist:default', initialUrl = 'https://google.com', initialZoom = 0.8) {
    if (this.views.has(cellId)) {
      this.destroyView(cellId);
    } else if (this.views.size >= 4) {
      console.warn(`[ViewManager] Tentativa de criar 5ª sessão bloqueada. Limite máximo é 4.`);
      return { success: false, error: 'Limite máximo de 4 sessões atingido.' };
    }

    // Obtém a sessão referente à partição da célula
    const targetSession = session.fromPartition(partitionId);
    targetSession.setUserAgent(AUTHENTIC_CHROME_UA);

    // Intercepta especificamente rotas do Google Auth para forçar User-Agent Firefox (Bypass oficial do bloqueio de app inseguro)
    if (!targetSession.__googleAuthFilterSetup) {
      targetSession.__googleAuthFilterSetup = true;
      try {
        targetSession.webRequest.onBeforeSendHeaders(
          { urls: ['https://accounts.google.com/*', 'https://ssl.gstatic.com/*', 'https://myaccount.google.com/*'] },
          (details, callback) => {
            const requestHeaders = details.requestHeaders || {};
            requestHeaders['User-Agent'] = FIREFOX_GOOGLE_AUTH_UA;
            delete requestHeaders['Sec-CH-UA'];
            delete requestHeaders['Sec-CH-UA-Mobile'];
            delete requestHeaders['Sec-CH-UA-Platform'];
            callback({ requestHeaders });
          }
        );
      } catch (e) {
        console.error('Erro ao configurar filtro do Google Auth:', e);
      }
    }

    // Configuração webPreferences limpa nativa de Chromium
    const webPreferences = {
      partition: partitionId,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      spellcheck: false, // Otimização extrema de RAM/CPU (Desativa verificador ortográfico nas 4 sessões)
      backgroundThrottling: false,
      preload: path.join(__dirname, 'viewPreload.js')
    };

    let view;
    if (WebContentsView && this.mainWindow.contentView && typeof this.mainWindow.contentView.addChildView === 'function') {
      view = new WebContentsView({ webPreferences });
      this.mainWindow.contentView.addChildView(view);
    } else if (BrowserView) {
      view = new BrowserView({ webPreferences });
      this.mainWindow.addBrowserView(view);
    } else {
      console.error('Nenhum suporte a WebContentsView ou BrowserView foi encontrado nesta versão do Electron.');
      return { success: false, error: 'View API não suportada' };
    }

    // Aplica o User-Agent nativo e o Zoom inicial
    if (view.webContents) {
      view.webContents.setUserAgent(AUTHENTIC_CHROME_UA);
      try {
        const numericZoom = Math.min(Math.max(parseFloat(initialZoom) || 0.8, 0.3), 3.0);
        view.webContents.setZoomFactor(numericZoom);
      } catch (e) {
        console.error('Erro ao definir fator de zoom inicial:', e);
      }
    }

    // Define dimensões iniciais padrão antes do primeiro loadURL
    view.setBounds({ x: 0, y: 0, width: 400, height: 300 });

    // Carrega a URL inicial
    let formattedUrl = initialUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    view.webContents.loadURL(formattedUrl).catch(err => {
      const msg = err.message || '';
      if (!msg.includes('ERR_FAILED') && !msg.includes('ERR_ABORTED') && !msg.includes('destroyed')) {
        console.log(`Erro ao carregar URL na view ${cellId}:`, msg);
      }
    });

    const viewData = {
      view,
      partitionId,
      muted: false,
      url: formattedUrl,
      zoomFactor: parseFloat(initialZoom) || 0.8,
      cellId,
      createdAt: Date.now(),
      title: 'Carregando...'
    };

    if (view.webContents) {
      view.webContents.on('page-title-updated', (event, title) => {
        viewData.title = title;
        this.emitStats();
      });
      view.webContents.on('did-finish-load', () => {
        if (view.webContents && !view.webContents.isDestroyed()) {
          viewData.title = view.webContents.getTitle() || viewData.url;
          try {
            const currentUrl = view.webContents.getURL();
            if (currentUrl && currentUrl !== 'about:blank') {
              viewData.url = currentUrl;
            }
          } catch (e) {}
          this.emitStats();
        }
      });
      view.webContents.on('did-navigate', (event, url) => {
        if (view.webContents && !view.webContents.isDestroyed() && url && url !== 'about:blank') {
          viewData.url = url;
          this.emitStats();
        }
      });
      view.webContents.on('did-navigate-in-page', (event, url) => {
        if (view.webContents && !view.webContents.isDestroyed() && url && url !== 'about:blank') {
          viewData.url = url;
          this.emitStats();
        }
      });
    }

    this.views.set(cellId, viewData);

    // Notifica atualização de estatísticas
    this.emitStats();

    return { success: true, cellId, partitionId };
  }

  updateViewBounds(cellId, bounds) {
    const item = this.views.get(cellId);
    if (!item || !item.view) return;

    // Arredonda valores inteiros de pixels para evitar borrão de subpixel
    const x = Math.round(bounds.x || 0);
    const y = Math.round(bounds.y || 0);
    const width = Math.max(0, Math.round(bounds.width || 0));
    const height = Math.max(0, Math.round(bounds.height || 0));

    if (width > 0 && height > 0) {
      item.lastVisibleBounds = { width, height };
    }

    item.view.setBounds({ x, y, width, height });
  }

  destroyView(cellId) {
    const item = this.views.get(cellId);
    if (item && item.view) {
      try {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          if (this.mainWindow.contentView && typeof this.mainWindow.contentView.removeChildView === 'function') {
            this.mainWindow.contentView.removeChildView(item.view);
          } else if (typeof this.mainWindow.removeBrowserView === 'function') {
            this.mainWindow.removeBrowserView(item.view);
          }
        }
        if (item.view.webContents && !item.view.webContents.isDestroyed()) {
          item.view.webContents.close();
        }
      } catch (e) {
        console.error(`Erro ao destruir view ${cellId}:`, e);
      }
      this.views.delete(cellId);
      this.emitStats();
    }
  }

  navigateView(cellId, url) {
    const item = this.views.get(cellId);
    if (item && item.view) {
      let targetUrl = url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      item.url = targetUrl;
      item.view.webContents.loadURL(targetUrl);
    }
  }

  reloadView(cellId) {
    const item = this.views.get(cellId);
    if (item && item.view) {
      item.view.webContents.reload();
    }
  }

  toggleMuteView(cellId, muted) {
    const item = this.views.get(cellId);
    if (item && item.view) {
      item.muted = muted;
      item.view.webContents.setAudioMuted(muted);
    }
  }

  injectCustomCSS(cellId, css) {
    const item = this.views.get(cellId);
    if (item && item.view) {
      item.view.webContents.insertCSS(css);
    }
  }

  setZoomFactor(cellId, factor) {
    const item = this.views.get(cellId);
    if (item && item.view && item.view.webContents) {
      try {
        const numericFactor = Math.min(Math.max(parseFloat(factor) || 1.0, 0.3), 3.0);
        item.zoomFactor = numericFactor;
        item.view.webContents.setZoomFactor(numericFactor);
        return { success: true, cellId, zoomFactor: numericFactor };
      } catch (e) {
        console.error(`Erro ao aplicar zoom na view ${cellId}:`, e);
      }
    }
    return { success: false };
  }

  triggerAfkTouch(cellId) {
    const item = this.views.get(cellId);
    if (!item || !item.view) return { success: false, error: 'View não encontrada' };

    try {
      const wc = item.view.webContents;
      if (wc && !wc.isDestroyed()) {
        const bounds = item.view.getBounds();
        const effectiveWidth = bounds.width > 0 ? bounds.width : (item.lastVisibleBounds?.width || 800);
        const effectiveHeight = bounds.height > 0 ? bounds.height : (item.lastVisibleBounds?.height || 600);

        const centerX = Math.max(20, Math.floor(effectiveWidth / 2));
        const centerY = Math.max(20, Math.floor(effectiveHeight / 2));

        // Envia evento de clique humanizado (mouseDown + mouseUp com pequeno atraso)
        wc.sendInputEvent({ type: 'mouseDown', x: centerX, y: centerY, button: 'left', clickCount: 1 });
        setTimeout(() => {
          if (wc && !wc.isDestroyed()) {
            wc.sendInputEvent({ type: 'mouseUp', x: centerX, y: centerY, button: 'left', clickCount: 1 });
          }
        }, 80);

        console.log(`[Anti-AFK IPC] Toque de prevenção AFK disparado na view ${cellId} em x=${centerX}, y=${centerY}`);
        return { success: true, x: centerX, y: centerY };
      }
    } catch (e) {
      console.error(`[Anti-AFK IPC] Erro ao simular clique na view ${cellId}:`, e);
    }
    return { success: false };
  }

  destroyAll() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
    for (const [cellId] of this.views) {
      this.destroyView(cellId);
    }
  }

  emitStats() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    let appMetrics = [];
    try {
      if (app && typeof app.getAppMetrics === 'function') {
        appMetrics = app.getAppMetrics();
      }
    } catch (e) {
      console.error('Erro ao obter appMetrics:', e);
    }

    const metricsByPid = new Map();
    for (const m of appMetrics) {
      metricsByPid.set(m.pid, m);
    }

    const partitionsStats = [];
    for (const [cellId, item] of this.views.entries()) {
      let cpuPercent = 0;
      let ramMB = 0;
      let pid = null;

      if (item.view && item.view.webContents && !item.view.webContents.isDestroyed()) {
        try {
          pid = item.view.webContents.getOSProcessId();
          const metric = metricsByPid.get(pid);
          if (metric) {
            cpuPercent = Math.max(0, metric.cpu.percentCPUUsage || 0);
            if (metric.memory) {
              ramMB = Math.round((metric.memory.workingSetSize || metric.memory.privateBytes || 0) / 1024);
            }
          }
        } catch (e) {
          // ignore error if process destroyed during check
        }
      }

      partitionsStats.push({
        cellId,
        partitionId: item.partitionId,
        url: item.url,
        muted: item.muted,
        title: item.title || item.url,
        createdAt: item.createdAt || Date.now(),
        cpu: cpuPercent.toFixed(1),
        ram: ramMB,
        pid
      });
    }

    const stats = {
      totalViews: this.views.size,
      partitions: partitionsStats
    };

    this.mainWindow.webContents.send('view-stats-update', stats);
  }
}

module.exports = ViewManager;
