const { app, BrowserWindow, ipcMain, globalShortcut, shell, Menu } = require('electron');
const path = require('path');
const ViewManager = require('./viewManager');

// User-Agent nativo autêntico de Google Chrome Desktop real
const AUTHENTIC_CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
app.userAgentFallback = AUTHENTIC_CHROME_UA;

// Otimizações nativas do Chromium, desativação de automação, aceleração de GPU e alta performance sem throttling
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');
app.commandLine.appendSwitch('disable-features', 'UserAgentClientHint,Translate,CalculateNativeWinOcclusion');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('override-plugin-power-saver-for-testing', 'never');
app.commandLine.appendSwitch('enable-smooth-scrolling');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('num-raster-threads', '4');

let mainWindow;
let viewManager;
let currentBossKeyShortcut = 'Alt+H';

function registerBossKey(shortcutStr) {
  try {
    globalShortcut.unregisterAll();
    if (!shortcutStr) return true;
    const success = globalShortcut.register(shortcutStr, () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
    if (success) {
      currentBossKeyShortcut = shortcutStr;
      console.log(`[BossKey] Atalho registrado com sucesso: ${shortcutStr}`);
      return true;
    } else {
      console.warn(`[BossKey] Falha ao registrar atalho: ${shortcutStr}`);
      return false;
    }
  } catch (err) {
    console.error(`[BossKey] Erro ao registrar atalho:`, err);
    return false;
  }
}

function createMainWindow() {
  Menu.setApplicationMenu(null); // Remove a barra nativa File Edit View Help
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Multi 4.0 - Painel Multi-Sessão & Alta Performance",
    backgroundColor: "#0B0F17",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  viewManager = new ViewManager(mainWindow);

  // Carrega a interface React (Servidor de Dev do Vite ou Build Estático)
  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    if (viewManager) {
      viewManager.destroyAll();
    }
    mainWindow = null;
  });
}

// Configuração dos Handlers IPC do Processo Principal
ipcMain.handle('create-view', (event, { cellId, partitionId, initialUrl, zoomFactor }) => {
  console.log(`[IPC] Criando view cellId=${cellId}, partition=${partitionId}, url=${initialUrl}, zoom=${zoomFactor}`);
  return viewManager.createView(cellId, partitionId, initialUrl, zoomFactor);
});

ipcMain.handle('set-zoom-factor', (event, { cellId, factor }) => {
  console.log(`[IPC] Aplicando zoom cellId=${cellId}, factor=${factor}`);
  return viewManager.setZoomFactor(cellId, factor);
});

ipcMain.on('update-view-bounds', (event, { cellId, bounds }) => {
  viewManager.updateViewBounds(cellId, bounds);
});

ipcMain.on('destroy-view', (event, { cellId }) => {
  console.log(`[IPC] Destruindo view cellId=${cellId}`);
  viewManager.destroyView(cellId);
});

ipcMain.on('navigate-view', (event, { cellId, url }) => {
  console.log(`[IPC] Navegando view cellId=${cellId}, url=${url}`);
  viewManager.navigateView(cellId, url);
});

ipcMain.on('reload-view', (event, { cellId }) => {
  console.log(`[IPC] Recarregando view cellId=${cellId}`);
  viewManager.reloadView(cellId);
});

ipcMain.on('toggle-mute-view', (event, { cellId, muted }) => {
  console.log(`[IPC] Toggle Mute cellId=${cellId}, muted=${muted}`);
  viewManager.toggleMuteView(cellId, muted);
});

ipcMain.on('inject-css-view', (event, { cellId, css }) => {
  console.log(`[IPC] Injetando CSS em cellId=${cellId}`);
  viewManager.injectCustomCSS(cellId, css);
});

ipcMain.handle('trigger-afk-touch', (event, { cellId }) => {
  return viewManager.triggerAfkTouch(cellId);
});

ipcMain.on('open-external-url', (event, url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    shell.openExternal(url);
  }
});

// Controles de Ocultação da Janela e Atalho Global (Boss Key - Sem Bandeja)
ipcMain.on('hide-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
});

ipcMain.handle('set-boss-key-shortcut', (event, shortcutStr) => {
  const success = registerBossKey(shortcutStr);
  return { success, shortcut: currentBossKeyShortcut };
});

ipcMain.handle('get-boss-key-shortcut', () => {
  return currentBossKeyShortcut;
});

app.whenReady().then(() => {
  createMainWindow();
  registerBossKey(currentBossKeyShortcut);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
