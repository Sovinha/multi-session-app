const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sessionGridAPI', {
  createView: (cellId, partitionId, initialUrl, zoomFactor) => 
    ipcRenderer.invoke('create-view', { cellId, partitionId, initialUrl, zoomFactor }),

  setZoomFactor: (cellId, factor) =>
    ipcRenderer.invoke('set-zoom-factor', { cellId, factor }),
    
  updateViewBounds: (cellId, bounds) => 
    ipcRenderer.send('update-view-bounds', { cellId, bounds }),
    
  destroyView: (cellId) => 
    ipcRenderer.send('destroy-view', { cellId }),
    
  navigateView: (cellId, url) => 
    ipcRenderer.send('navigate-view', { cellId, url }),
    
  reloadView: (cellId) => 
    ipcRenderer.send('reload-view', { cellId }),
    
  toggleMuteView: (cellId, muted) => 
    ipcRenderer.send('toggle-mute-view', { cellId, muted }),

  injectCustomCSS: (cellId, css) =>
    ipcRenderer.send('inject-css-view', { cellId, css }),
    
  triggerAfkTouch: (cellId) =>
    ipcRenderer.invoke('trigger-afk-touch', { cellId }),

  hideWindow: () =>
    ipcRenderer.send('hide-window'),

  setBossKeyShortcut: (shortcut) =>
    ipcRenderer.invoke('set-boss-key-shortcut', shortcut),

  getBossKeyShortcut: () =>
    ipcRenderer.invoke('get-boss-key-shortcut'),

  openExternalUrl: (url) =>
    ipcRenderer.send('open-external-url', url),

  onViewStats: (callback) => {
    ipcRenderer.on('view-stats-update', (event, stats) => callback(stats));
  }
});
