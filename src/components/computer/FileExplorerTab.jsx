/**
 * FileExplorerTab.jsx — Windows XP Dosya Gezgini (File Explorer) Bileşeni
 *
 * Reaktif VFS yapısı ile Belgelerim, Projeler ve Masaüstü klasörlerini görüntüler.
 * Dosyaya çift tıklandığında Kod Editörü penceresini açar.
 */

import { useState, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import useVFS from '../../hooks/useVFS';
import missions from '../../data/missions.json';
import { getFileIcon } from './EditorTab';
import PropertiesModal from './PropertiesModal';
import './FileExplorerTab.css';

export default function FileExplorerTab({
  onOpenFile,
  onOpenTerminal,
  onOpenIDE,
  initialPath = '/home/user',
}) {
  const vfs = useVFS();
  const activeMissionIds = useGameStore((s) => s.career.activeMissions) || [];
  const activeMissions = missions.filter((m) => activeMissionIds.includes(m.id));

  // Gezinti konumu state'i
  const [currentPath, setCurrentPath] = useState(initialPath || '/home/user');
  const [contextMenu, setContextMenu] = useState(null);
  const [propertiesPath, setPropertiesPath] = useState(null);

  useEffect(() => {
    if (initialPath) {
      setCurrentPath(initialPath);
    }
  }, [initialPath]);

  const dirRes = vfs.ls(currentPath);
  const entries = dirRes.success ? dirRes.entries : [];

  const handleItemDoubleClick = (item) => {
    if (item.type === 'dir') {
      const nextPath = `${currentPath}/${item.name}`.replace(/\/+/g, '/');
      setCurrentPath(nextPath);
    } else if (item.type === 'file') {
      const fullPath = `${currentPath}/${item.name}`.replace(/\/+/g, '/');
      const catRes = vfs.cat(fullPath);
      if (onOpenFile) {
        onOpenFile({ name: item.name, path: fullPath, content: catRes.success ? catRes.content : '' });
      }
    }
  };

  const handleGoUp = () => {
    if (currentPath === '/home/user' || currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath('/' + parts.join('/'));
  };

  const handleCreateFile = () => {
    const fileName = prompt('Oluşturulacak dosya adı (Örn: app.py):');
    if (!fileName || !fileName.trim()) return;
    const fullPath = `${currentPath}/${fileName.trim()}`.replace(/\/+/g, '/');
    const res = vfs.touch(fullPath);
    if (!res.success) alert(res.error || 'Dosya oluşturulamadı');
    setContextMenu(null);
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Oluşturulacak klasör adı (Örn: src):');
    if (!folderName || !folderName.trim()) return;
    const fullPath = `${currentPath}/${folderName.trim()}`.replace(/\/+/g, '/');
    const res = vfs.mkdir(fullPath, true);
    if (!res.success) alert(res.error || 'Klasör oluşturulamadı');
    setContextMenu(null);
  };

  const handleItemContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const fullPath = `${currentPath}/${item.name}`.replace(/\/+/g, '/');
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: item.type,
      item,
      path: fullPath,
    });
  };

  const handleBackgroundContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'background',
      path: currentPath,
    });
  };

  const handleDeleteItem = (targetPath, isDir = false) => {
    vfs.rm(targetPath, isDir);
    setContextMenu(null);
  };

  return (
    <div
      className="xp-explorer"
      onClick={() => setContextMenu(null)}
      onContextMenu={handleBackgroundContextMenu}
    >
      {/* XP Araç Çubuğu & Adres Çubuğu */}
      <div className="xp-explorer__toolbar">
        <div className="xp-explorer__nav-btns">
          <button
            className="xp-explorer__nav-btn"
            disabled={currentPath === '/home/user' || currentPath === '/'}
            onClick={handleGoUp}
            title="Yukarı Klasör"
          >
            ⬅ Yukarı
          </button>
          <button className="xp-explorer__nav-btn" onClick={handleCreateFile} title="Bulunulan Dizin İçinde Yeni Dosya">
            ➕ Yeni Dosya
          </button>
          <button className="xp-explorer__nav-btn" onClick={handleCreateFolder} title="Bulunulan Dizin İçinde Yeni Klasör">
            📁 Yeni Klasör
          </button>
        </div>
        <div className="xp-explorer__address-bar">
          <span className="xp-explorer__address-icon">📍</span>
          <span className="xp-explorer__address-text">📍 {currentPath}</span>
        </div>
      </div>

      <div className="xp-explorer__body">
        {/* Sol Kenar Çubuğu */}
        <div className="xp-explorer__sidebar">
          <div className="xp-explorer__panel">
            <div className="xp-explorer__panel-title">Sistem Klasörleri</div>
            <div className="xp-explorer__panel-content">
              <div onClick={() => setCurrentPath('/home/user/desktop')}>💻 Masaüstü</div>
              <div onClick={() => setCurrentPath('/home/user/documents')}>📄 Belgelerim</div>
              <div onClick={() => setCurrentPath('/home/user/projects')}>📦 Projelerim</div>
            </div>
          </div>

          <div className="xp-explorer__panel">
            <div className="xp-explorer__panel-title">Sistem Durumu</div>
            <div className="xp-explorer__panel-content">
              <div>💾 Aktif Görev: {activeMissions.length}</div>
              <div>📂 Klasör Öğe: {entries.length}</div>
            </div>
          </div>
        </div>

        {/* Ana İçerik Görünümü */}
        <div className="xp-explorer__content">
          {entries.length === 0 ? (
            <div className="xp-explorer__empty">Bu klasör boş.</div>
          ) : (
            <div className="xp-explorer__grid">
              {entries.map((item) => {
                let icon = '📄';
                if (item.type === 'dir') icon = '📁';
                else if (item.type === 'app') icon = item.icon || '📱';
                else icon = getFileIcon(item.name);

                return (
                  <div
                    key={item.name}
                    className="xp-explorer__item"
                    onDoubleClick={(e) => { e.stopPropagation(); handleItemDoubleClick(item); }}
                    onContextMenu={(e) => handleItemContextMenu(e, item)}
                    title={item.type === 'dir' ? 'Çift tıklayarak gir' : 'Çift tıklayarak editörde aç'}
                  >
                    <span className="xp-explorer__item-icon">{icon}</span>
                    <span className="xp-explorer__item-name">{item.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Explorer Sağ Tık Menüsü */}
      {contextMenu && (
        <div
          className="xp-context-menu"
          style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 9999 }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'dir' ? (
            <>
              <div className="xp-context-menu__item" onClick={() => { setCurrentPath(contextMenu.path); setContextMenu(null); }}>▶ Aç</div>
              <div className="xp-context-menu__item" onClick={() => { onOpenTerminal && onOpenTerminal(contextMenu.path); setContextMenu(null); }}>💻 Terminal ile Aç</div>
              <div className="xp-context-menu__item" onClick={() => { onOpenIDE && onOpenIDE(contextMenu.path); setContextMenu(null); }}>📝 IDE ile Aç</div>
              <div className="xp-context-menu__divider" />
              <div className="xp-context-menu__item" onClick={() => handleDeleteItem(contextMenu.path, true)}>🗑️ Sil</div>
              <div className="xp-context-menu__divider" />
              <div className="xp-context-menu__item" onClick={() => { setPropertiesPath(contextMenu.path); setContextMenu(null); }}>⚙️ Özellikler</div>
            </>
          ) : contextMenu.type === 'file' ? (
            <>
              <div className="xp-context-menu__item" onClick={() => { handleItemDoubleClick(contextMenu.item); setContextMenu(null); }}>▶ Aç</div>
              <div className="xp-context-menu__divider" />
              <div className="xp-context-menu__item" onClick={() => handleDeleteItem(contextMenu.path, false)}>🗑️ Sil</div>
              <div className="xp-context-menu__divider" />
              <div className="xp-context-menu__item" onClick={() => { setPropertiesPath(contextMenu.path); setContextMenu(null); }}>⚙️ Özellikler</div>
            </>
          ) : (
            <>
              <div className="xp-context-menu__item" onClick={() => setContextMenu(null)}>↻ Yenile</div>
              <div className="xp-context-menu__divider" />
              <div className="xp-context-menu__item" onClick={handleCreateFolder}>📁 Yeni Klasör</div>
              <div className="xp-context-menu__item" onClick={handleCreateFile}>📝 Yeni Dosya</div>
              <div className="xp-context-menu__divider" />
              <div className="xp-context-menu__item" onClick={() => { setPropertiesPath(contextMenu.path); setContextMenu(null); }}>⚙️ Özellikler</div>
            </>
          )}
        </div>
      )}

      {/* Özellikler (Properties) Modalı */}
      {propertiesPath && (
        <PropertiesModal targetPath={propertiesPath} onClose={() => setPropertiesPath(null)} />
      )}
    </div>
  );
}
