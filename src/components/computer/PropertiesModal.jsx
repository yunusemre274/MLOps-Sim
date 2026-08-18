/**
 * PropertiesModal.jsx — Windows XP Tarzı Dosya/Klasör Özellikleri (Properties) Modalı
 * (Round 11 / GÖREV GRUBU 3)
 */

import React from 'react';
import useVFS from '../../hooks/useVFS';
import { getFileIcon } from './EditorTab';
import './PropertiesModal.css';

export function getFileTypeName(item) {
  if (!item) return 'Bilinmeyen Öğe';
  if (item.type === 'dir') return 'Dosya Klasörü';
  if (item.type === 'app') return 'Sistem Uygulaması';
  const name = item.name || '';
  if (name.endsWith('.py')) return 'Python Dosyası (.py)';
  if (name.endsWith('.js')) return 'JavaScript Dosyası (.js)';
  if (name.endsWith('.ts')) return 'TypeScript Dosyası (.ts)';
  if (name.endsWith('.json')) return 'JSON Veri Dosyası (.json)';
  if (name.endsWith('.md')) return 'Markdown Belgesi (.md)';
  if (name.endsWith('.txt')) return 'Metin Belgesi (.txt)';
  if (name.endsWith('.yml') || name.endsWith('.yaml')) return 'YAML Konfigürasyon Dosyası (.yml)';
  if (name.includes('Dockerfile')) return 'Docker İmaj Tanım Dosyası';
  if (name.endsWith('.sh')) return 'Kabuk Script Dosyası (.sh)';
  return 'Dosya';
}

export default function PropertiesModal({ targetPath, onClose }) {
  const vfs = useVFS();
  const stats = vfs.getStats(targetPath);

  if (!stats.success) {
    return (
      <div className="xp-props-overlay" onClick={onClose}>
        <div className="xp-props-window" onClick={(e) => e.stopPropagation()}>
          <div className="xp-props-header">
            <span>⚙️ Özellikler</span>
            <button className="xp-props-close" onClick={onClose}>✕</button>
          </div>
          <div className="xp-props-body">
            <p className="xp-props-error">{stats.error || 'Özellikler alınamadı.'}</p>
            <div className="xp-props-footer">
              <button className="xp-props-btn" onClick={onClose}>Tamam</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const icon = stats.type === 'dir' ? '📁' : stats.type === 'app' ? '📱' : getFileIcon(stats.name);
  const typeName = getFileTypeName(stats);

  return (
    <div className="xp-props-overlay" onClick={onClose}>
      <div className="xp-props-window" onClick={(e) => e.stopPropagation()}>
        <div className="xp-props-header">
          <span>{icon} {stats.name} Özellikleri</span>
          <button className="xp-props-close" onClick={onClose}>✕</button>
        </div>
        <div className="xp-props-tabs">
          <div className="xp-props-tab xp-props-tab--active">Genel</div>
        </div>
        <div className="xp-props-body">
          <div className="xp-props-title-row">
            <span className="xp-props-big-icon">{icon}</span>
            <input className="xp-props-name-input" value={stats.name} readOnly />
          </div>

          <div className="xp-props-divider" />

          <div className="xp-props-grid">
            <div className="xp-props-label">Dosya Türü:</div>
            <div className="xp-props-val">{typeName}</div>

            <div className="xp-props-label">Konum:</div>
            <div className="xp-props-val xp-props-path">{stats.path}</div>

            <div className="xp-props-label">Boyut:</div>
            <div className="xp-props-val">
              <strong>{stats.sizeFormatted}</strong> ({stats.sizeBytes.toLocaleString('tr-TR')} bayt)
            </div>

            {stats.type === 'dir' && (
              <>
                <div className="xp-props-label">İçerik:</div>
                <div className="xp-props-val">
                  {stats.fileCount} dosya, {stats.dirCount} klasör
                </div>
              </>
            )}

            <div className="xp-props-label">Sahiplik:</div>
            <div className="xp-props-val">{stats.owner} (Kullanıcı)</div>

            <div className="xp-props-label">Değiştirilme:</div>
            <div className="xp-props-val">{stats.date}</div>
          </div>

          <div className="xp-props-divider" />

          <div className="xp-props-footer">
            <button className="xp-props-btn xp-props-btn--primary" onClick={onClose}>Tamam</button>
            <button className="xp-props-btn" onClick={onClose}>İptal</button>
          </div>
        </div>
      </div>
    </div>
  );
}
