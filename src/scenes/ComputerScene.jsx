/**
 * ComputerScene.jsx — Windows XP Masaüstü Simülasyon Sahnesi (Aşama 2 Sağlamlaşdırma)
 *
 * Özellikler:
 * - Bağımsız useWindowManager() hook'u ile robust pencere yönetimi
 * - VFS'ten tamamen ayrıştırılmış Window Manager state'i
 * - Sürüklenebilir masaüstü simgeleri (Drag & Drop)
 * - Sağ tık bağlam menüsü (Desktop/Icon context menu)
 * - Yeni Klasör/Dosya VFS senkronizasyonu
 */

import { useState, useRef } from 'react';
import useGameStore from '../store/useGameStore';
import useVFS from '../hooks/useVFS';
import useWindowManager from '../hooks/useWindowManager';

import WindowFrame from '../components/computer/WindowFrame';
import XpTaskbar from '../components/computer/XpTaskbar';

import TerminalTab from '../components/computer/TerminalTab';
import EditorTab, { getFileIcon } from '../components/computer/EditorTab';
import BrowserTab from '../components/computer/BrowserTab';
import TutorialHub from '../components/computer/TutorialHub';
import FileExplorerTab from '../components/computer/FileExplorerTab';
import MonitoringTab from '../components/computer/MonitoringTab';

import './ComputerScene.css';

export default function ComputerScene() {
  const setScene = useGameStore((s) => s.setScene);
  const vfs = useVFS();
  const wm = useWindowManager();

  const wmState = wm.getState();
  const windows = wmState.openWindows;
  const activeWindowId = wmState.activeWindowId;

  const [selectedIcon, setSelectedIcon] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);

  const draggingIconRef = useRef(null);

  // VFS /home/user/desktop/ düğümünün içeriğini okuma
  const desktopLs = vfs.ls('/home/user/desktop');
  const desktopEntries = desktopLs.success ? desktopLs.entries : [];

  const desktopIcons = desktopEntries.map((entry, idx) => {
    let icon = entry.icon || '📄';
    let appId = entry.appId;
    let name = entry.name;

    if (entry.type === 'dir') {
      icon = '📁';
      appId = 'explorer';
    } else if (entry.type === 'file') {
      icon = getFileIcon(entry.name);
      appId = 'editor';
    }

    const col = Math.floor(idx / 5);
    const row = idx % 5;
    const defaultX = 20 + col * 100;
    const defaultY = 20 + row * 90;

    return {
      id: entry.key || entry.name,
      name,
      icon,
      appId,
      type: entry.type,
      x: entry.x !== undefined ? entry.x : defaultX,
      y: entry.y !== undefined ? entry.y : defaultY,
    };
  });

  // Uygulama Açma
  const handleOpenApp = (appId, extraProps = {}) => {
    if (appId === 'jobs') {
      setScene('jobplatform');
      return;
    }
    wm.openApp(appId, extraProps);
  };

  // Simge Sürükleme (Drag & Drop)
  const handleIconMouseDown = (e, iconId) => {
    if (e.button !== 0) return;
    setSelectedIcon(iconId);
    setContextMenu(null);

    const iconObj = desktopIcons.find((i) => i.id === iconId);
    if (!iconObj) return;

    draggingIconRef.current = {
      id: iconId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: iconObj.x,
      initialY: iconObj.y,
    };

    const handleMouseMove = (moveEvent) => {
      if (!draggingIconRef.current) return;
      const dx = moveEvent.clientX - draggingIconRef.current.startX;
      const dy = moveEvent.clientY - draggingIconRef.current.startY;
      const newX = Math.max(10, draggingIconRef.current.initialX + dx);
      const newY = Math.max(10, draggingIconRef.current.initialY + dy);

      vfs.updateIconPosition(iconId, newX, newY);
    };

    const handleMouseUp = () => {
      draggingIconRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Context Menu
  const handleContextMenu = (e, targetIcon = null) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: targetIcon ? 'icon' : 'desktop',
      iconObj: targetIcon,
    });
  };

  const handleCreateNewFolder = () => {
    const name = `Yeni Klasör ${desktopIcons.filter((i) => i.type === 'dir').length + 1}`;
    vfs.mkdir(`/home/user/desktop/${name}`);
    setContextMenu(null);
  };

  const handleCreateNewFile = () => {
    const name = `Yeni Metin Belgesi ${desktopIcons.filter((i) => i.type === 'file').length + 1}.txt`;
    vfs.touch(`/home/user/desktop/${name}`);
    setContextMenu(null);
  };

  const handleDeleteIcon = (iconObj) => {
    vfs.rm(`/home/user/desktop/${iconObj.id}`, true);
    setContextMenu(null);
  };

  const handleIconDoubleClick = (iconObj) => {
    if (iconObj.type === 'app') {
      handleOpenApp(iconObj.appId);
    } else if (iconObj.type === 'file') {
      const catRes = vfs.cat(`/home/user/desktop/${iconObj.name}`);
      handleOpenApp('editor', {
        initialFile: {
          name: iconObj.name,
          path: `/home/user/desktop/${iconObj.name}`,
          content: catRes.success ? catRes.content : '',
        },
      });
    } else if (iconObj.type === 'dir') {
      const folderPath =
        iconObj.name === 'Projelerim' || iconObj.name === 'projects'
          ? '/home/user/projects'
          : iconObj.name === 'Belgelerim' || iconObj.name === 'documents'
          ? '/home/user/documents'
          : `/home/user/desktop/${iconObj.name}`;
      handleOpenApp('explorer', { initialPath: folderPath });
    }
  };

  // Uygulama İçi Render
  const renderAppContent = (win) => {
    switch (win.appId) {
      case 'terminal':
        return <TerminalTab />;
      case 'explorer':
        return (
          <FileExplorerTab
            initialPath={win.extraProps?.initialPath || '/home/user'}
            onOpenFile={(file) => handleOpenApp('editor', { initialFile: file })}
          />
        );
      case 'editor':
        return <EditorTab initialFile={win.extraProps?.initialFile} />;
      case 'browser_chrome':
        return <BrowserTab browserName="Chrome" />;
      case 'browser_edge':
        return <BrowserTab browserName="Edge" />;
      case 'tutorials':
        return <TutorialHub />;
      case 'monitoring':
        return <MonitoringTab windowsCount={windows.length} />;
      case 'trash':
        return (
          <div style={{ padding: 24, textAlign: 'center', color: '#cdd6f4' }}>
            <span style={{ fontSize: 48 }}>🗑️</span>
            <h3>Geri Dönüşüm Kutusu</h3>
            <p style={{ opacity: 0.7 }}>Çöp kutusu boş.</p>
          </div>
        );
      default:
        return <div style={{ padding: 24 }}>Uygulama yükleniyor...</div>;
    }
  };

  return (
    <div className="xp-desktop-scene">
      {/* Masaüstü Arka Planı ve Simgeler */}
      <div
        className="xp-desktop"
        onClick={() => { setSelectedIcon(null); setContextMenu(null); }}
        onContextMenu={(e) => handleContextMenu(e, null)}
      >
        {desktopIcons.map((icon) => (
          <div
            key={icon.id}
            className={`xp-desktop-icon ${selectedIcon === icon.id ? 'xp-desktop-icon--selected' : ''}`}
            style={{ position: 'absolute', left: icon.x, top: icon.y }}
            onMouseDown={(e) => handleIconMouseDown(e, icon.id)}
            onDoubleClick={(e) => { e.stopPropagation(); handleIconDoubleClick(icon); }}
            onContextMenu={(e) => { e.stopPropagation(); handleContextMenu(e, icon); }}
          >
            <span className="xp-desktop-icon__img">{icon.icon}</span>
            <span className="xp-desktop-icon__text">{icon.name}</span>
          </div>
        ))}

        {/* Jenerik Pencereler */}
        {windows.map((win) => (
          <WindowFrame
            key={win.id}
            windowId={win.id}
            title={win.title}
            icon={win.icon}
            initialPosition={win.position}
            initialSize={win.size}
            isMinimized={win.isMinimized}
            isMaximized={win.isMaximized}
            zIndex={win.zIndex}
            isFocused={activeWindowId === win.id}
            onFocus={(id) => wm.focusWindow(id)}
            onClose={(id) => wm.closeWindow(id)}
            onMinimize={(id) => wm.minimizeWindow(id)}
            onMaximize={(id) => wm.maximizeWindow(id)}
            onDoubleClickTitle={(id) => wm.maximizeWindow(id)}
          >
            {renderAppContent(win)}
          </WindowFrame>
        ))}

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="xp-context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.type === 'desktop' ? (
              <>
                <div className="xp-context-menu__item" onClick={() => setContextMenu(null)}>↻ Yenile</div>
                <div className="xp-context-menu__divider" />
                <div className="xp-context-menu__item" onClick={handleCreateNewFolder}>📁 Yeni Klasör</div>
                <div className="xp-context-menu__item" onClick={handleCreateNewFile}>📝 Yeni Metin Belgesi</div>
                <div className="xp-context-menu__divider" />
                <div className="xp-context-menu__item" onClick={() => { setShowPropertiesModal(true); setContextMenu(null); }}>⚙️ Özellikler</div>
              </>
            ) : (
              <>
                <div className="xp-context-menu__item" onClick={() => { handleIconDoubleClick(contextMenu.iconObj); setContextMenu(null); }}>▶ Aç</div>
                <div className="xp-context-menu__item" onClick={() => handleDeleteIcon(contextMenu.iconObj)}>🗑️ Sil</div>
              </>
            )}
          </div>
        )}

        {/* Özellikler Modalı */}
        {showPropertiesModal && (
          <div className="xp-properties-modal">
            <div className="xp-properties-modal__content">
              <h3>⚙️ Masaüstü Özellikleri</h3>
              <p>İşletim Sistemi: Windows XP MLOps Edition</p>
              <p>Açık Pencere Sayısı: {windows.length}</p>
              <p>Pencere Yöneticisi: Bağımsız (WindowManagerEngine)</p>
              <button onClick={() => setShowPropertiesModal(false)}>Kapat</button>
            </div>
          </div>
        )}
      </div>

      {/* Görev Çubuğu */}
      <XpTaskbar
        windows={windows}
        focusedId={activeWindowId}
        onWindowClick={(id) => wm.toggleTaskbarWindow(id)}
        onOpenApp={handleOpenApp}
      />
    </div>
  );
}
