import { useEffect, useState, useCallback } from 'react';

export function useWebViews() {
  const [stats, setStats] = useState({ totalViews: 0, partitions: [] });
  const isElectron = typeof window !== 'undefined' && Boolean(window.sessionGridAPI);

  useEffect(() => {
    if (isElectron) {
      window.sessionGridAPI.onViewStats((newStats) => {
        setStats(newStats);
      });
    }
  }, [isElectron]);

  const createView = useCallback((cellId, partitionId, initialUrl, zoomFactor) => {
    if (isElectron) {
      window.sessionGridAPI.createView(cellId, partitionId, initialUrl, zoomFactor);
    }
  }, [isElectron]);

  const setZoomFactor = useCallback((cellId, factor) => {
    if (isElectron && window.sessionGridAPI.setZoomFactor) {
      return window.sessionGridAPI.setZoomFactor(cellId, factor);
    }
    return Promise.resolve({ success: false });
  }, [isElectron]);

  const updateBounds = useCallback((cellId, bounds) => {
    if (isElectron) {
      window.sessionGridAPI.updateViewBounds(cellId, bounds);
    }
  }, [isElectron]);

  const destroyView = useCallback((cellId) => {
    if (isElectron) {
      window.sessionGridAPI.destroyView(cellId);
    }
  }, [isElectron]);

  const navigateView = useCallback((cellId, url) => {
    if (isElectron) {
      window.sessionGridAPI.navigateView(cellId, url);
    }
  }, [isElectron]);

  const reloadView = useCallback((cellId) => {
    if (isElectron) {
      window.sessionGridAPI.reloadView(cellId);
    }
  }, [isElectron]);

  const toggleMuteView = useCallback((cellId, muted) => {
    if (isElectron) {
      window.sessionGridAPI.toggleMuteView(cellId, muted);
    }
  }, [isElectron]);

  const injectCSS = useCallback((cellId, css) => {
    if (isElectron) {
      window.sessionGridAPI.injectCustomCSS(cellId, css);
    }
  }, [isElectron]);

  const triggerAfkTouch = useCallback((cellId) => {
    if (isElectron && window.sessionGridAPI.triggerAfkTouch) {
      return window.sessionGridAPI.triggerAfkTouch(cellId);
    }
    return Promise.resolve({ success: false });
  }, [isElectron]);

  const hideWindow = useCallback(() => {
    if (isElectron && window.sessionGridAPI.hideWindow) {
      window.sessionGridAPI.hideWindow();
    }
  }, [isElectron]);

  const setBossKeyShortcut = useCallback((shortcut) => {
    if (isElectron && window.sessionGridAPI.setBossKeyShortcut) {
      return window.sessionGridAPI.setBossKeyShortcut(shortcut);
    }
    return Promise.resolve({ success: false, shortcut: 'Alt+H' });
  }, [isElectron]);

  const getBossKeyShortcut = useCallback(() => {
    if (isElectron && window.sessionGridAPI.getBossKeyShortcut) {
      return window.sessionGridAPI.getBossKeyShortcut();
    }
    return Promise.resolve('Alt+H');
  }, [isElectron]);

  const openExternalUrl = useCallback((url) => {
    if (isElectron && window.sessionGridAPI.openExternalUrl) {
      window.sessionGridAPI.openExternalUrl(url);
    } else {
      window.open(url, '_blank');
    }
  }, [isElectron]);

  return {
    isElectron,
    stats,
    createView,
    setZoomFactor,
    updateBounds,
    destroyView,
    navigateView,
    reloadView,
    toggleMuteView,
    injectCSS,
    triggerAfkTouch,
    hideWindow,
    setBossKeyShortcut,
    getBossKeyShortcut,
    openExternalUrl
  };
}
