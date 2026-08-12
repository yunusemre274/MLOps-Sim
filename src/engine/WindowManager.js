/**
 * WindowManager.js — Merkezi Bağımsız Pencere Yöneticisi Motoru (Aşama 2)
 *
 * KURAL: Window Manager state'i VFS ve GameState'ten TAMAMEN BAĞIMSIZDIR.
 * Sadece açık pencereleri, pozisyon/boyut, minimize/maximize ve z-index durumunu yönetir.
 */

export class WindowManagerEngine {
  constructor() {
    this.listeners = new Set();
    this.openWindows = [];
    this.activeWindowId = null;
    this.zIndexCounter = 100;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    this.listeners.forEach((cb) => {
      try { cb(); } catch (err) { console.error('[WindowManager] Listener error:', err); }
    });
  }

  getState() {
    return {
      openWindows: this.openWindows,
      activeWindowId: this.activeWindowId,
    };
  }

  openApp(appId, options = {}) {
    const isMultiInstance = appId === 'terminal';

    // Single-instance kontrolü
    if (!isMultiInstance) {
      const existing = this.openWindows.find((w) => w.appId === appId);
      if (existing) {
        this.focusWindow(existing.id);
        if (existing.isMinimized) {
          existing.isMinimized = false;
        }
        if (options.initialFile) {
          existing.extraProps = { ...existing.extraProps, initialFile: options.initialFile };
        }
        this._notify();
        return existing.id;
      }
    }

    const newZ = ++this.zIndexCounter;
    const windowId = `win_${appId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const offset = (this.openWindows.length % 6) * 30;

    let initialSize = { width: 680, height: 450 };
    if (appId === 'terminal') initialSize = { width: 720, height: 480 };
    if (appId === 'editor') initialSize = { width: 780, height: 520 };
    if (appId === 'explorer') initialSize = { width: 640, height: 420 };
    if (appId === 'monitoring') initialSize = { width: 560, height: 460 };

    const title = options.title || options.initialFile?.name || getAppDefaultTitle(appId);
    const icon = options.icon || getAppDefaultIcon(appId);

    const newWindow = {
      id: windowId,
      appId,
      title,
      icon,
      position: options.position || { x: 60 + offset, y: 30 + offset },
      size: options.size || initialSize,
      zIndex: newZ,
      isMinimized: false,
      isMaximized: false,
      extraProps: options.initialFile ? { initialFile: options.initialFile } : (options.extraProps || {}),
    };

    this.openWindows.push(newWindow);
    this.activeWindowId = windowId;
    this._notify();
    return windowId;
  }

  focusWindow(windowId) {
    const win = this.openWindows.find((w) => w.id === windowId);
    if (!win) return;

    this.zIndexCounter++;
    win.zIndex = this.zIndexCounter;
    win.isMinimized = false;
    this.activeWindowId = windowId;
    this._notify();
  }

  minimizeWindow(windowId) {
    const win = this.openWindows.find((w) => w.id === windowId);
    if (!win) return;

    win.isMinimized = true;
    if (this.activeWindowId === windowId) {
      // Başka açık/minimized olmayan pencere varsa ona odaklan
      const remaining = this.openWindows.filter((w) => !w.isMinimized && w.id !== windowId);
      if (remaining.length > 0) {
        const topWin = remaining.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev), remaining[0]);
        this.activeWindowId = topWin.id;
      } else {
        this.activeWindowId = null;
      }
    }
    this._notify();
  }

  maximizeWindow(windowId) {
    const win = this.openWindows.find((w) => w.id === windowId);
    if (!win) return;

    win.isMaximized = !win.isMaximized;
    this.focusWindow(windowId);
  }

  closeWindow(windowId) {
    this.openWindows = this.openWindows.filter((w) => w.id !== windowId);
    if (this.activeWindowId === windowId) {
      const remaining = this.openWindows.filter((w) => !w.isMinimized);
      if (remaining.length > 0) {
        const topWin = remaining.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev), remaining[0]);
        this.activeWindowId = topWin.id;
      } else {
        this.activeWindowId = null;
      }
    }
    this._notify();
  }

  toggleTaskbarWindow(windowId) {
    const win = this.openWindows.find((w) => w.id === windowId);
    if (!win) return;

    if (win.isMinimized) {
      this.focusWindow(windowId);
    } else if (this.activeWindowId === windowId) {
      this.minimizeWindow(windowId);
    } else {
      this.focusWindow(windowId);
    }
  }

  reset() {
    this.openWindows = [];
    this.activeWindowId = null;
    this.zIndexCounter = 100;
    this._notify();
  }
}

function getAppDefaultTitle(appId) {
  switch (appId) {
    case 'terminal': return 'Terminal';
    case 'explorer': return 'Dosya Gezgini';
    case 'editor': return 'Kod Editörü';
    case 'browser_chrome': return 'Google Chrome';
    case 'browser_edge': return 'Microsoft Edge';
    case 'monitoring': return 'Monitoring';
    case 'tutorials': return 'Tutorial Hub';
    case 'jobs': return 'İş Platformu';
    case 'trash': return 'Geri Dönüşüm';
    default: return 'Pencere';
  }
}

function getAppDefaultIcon(appId) {
  switch (appId) {
    case 'terminal': return '⌨️';
    case 'explorer': return '📁';
    case 'editor': return '📝';
    case 'browser_chrome': return '🌐';
    case 'browser_edge': return '🌐';
    case 'monitoring': return '📊';
    case 'tutorials': return '📚';
    case 'jobs': return '💼';
    case 'trash': return '🗑️';
    default: return '🗔';
  }
}

export const windowManager = new WindowManagerEngine();
