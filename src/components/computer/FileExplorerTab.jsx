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
import './FileExplorerTab.css';

export default function FileExplorerTab({ onOpenFile, initialPath = '/home/user' }) {
  const vfs = useVFS();
  const activeMissionIds = useGameStore((s) => s.career.activeMissions) || [];
  const activeMissions = missions.filter((m) => activeMissionIds.includes(m.id));

  // Gezinti konumu state'i: '/home/user', '/home/user/projects', '/home/user/desktop', '/home/user/documents'
  const [currentPath, setCurrentPath] = useState(initialPath || '/home/user');

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
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Oluşturulacak klasör adı (Örn: src):');
    if (!folderName || !folderName.trim()) return;
    const fullPath = `${currentPath}/${folderName.trim()}`.replace(/\/+/g, '/');
    const res = vfs.mkdir(fullPath, true);
    if (!res.success) alert(res.error || 'Klasör oluşturulamadı');
  };

  return (
    <div className="xp-explorer">
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
                    onDoubleClick={() => handleItemDoubleClick(item)}
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
    </div>
  );
}
