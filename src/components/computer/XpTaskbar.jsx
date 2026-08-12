/**
 * XpTaskbar.jsx — Windows XP Görev Çubuğu & Başlat Menüsü Bileşeni (Aşama 3)
 *
 * Sol altta "start" butonu + tam işlevsel Başlat Menüsü,
 * Ortada açık pencereler (XP toggle: aktifse minimize, pasifse öne getir),
 * Sağ altta oyun saati ve sistem tepsisi.
 */

import { useState, useRef, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import './XpTaskbar.css';

export default function XpTaskbar({
  openWindows = [],
  focusedWindowId,
  onWindowClick,
  onOpenApp,
}) {
  const [startOpen, setStartOpen] = useState(false);
  const setScene = useGameStore((s) => s.setScene);
  const currentTime = useGameStore((s) => s.currentTime);
  const dayCount = useGameStore((s) => s.dayCount);
  const startRef = useRef(null);

  // Dışa tıklamada menüyü kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (startRef.current && !startRef.current.contains(e.target)) {
        setStartOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShutdown = () => {
    setScene('home');
  };

  return (
    <div className="xp-taskbar">
      {/* Başlat Butonu & Menüsü */}
      <div className="xp-start-container" ref={startRef}>
        <button
          className={`xp-start-btn ${startOpen ? 'xp-start-btn--active' : ''}`}
          onClick={() => setStartOpen(!startOpen)}
        >
          <span className="xp-start-btn__flag">❖</span>
          <span className="xp-start-btn__text">start</span>
        </button>

        {startOpen && (
          <div className="xp-start-menu">
            <div className="xp-start-menu__header">
              <span className="xp-start-menu__avatar">👤</span>
              <span className="xp-start-menu__username">MLOps Engineer</span>
            </div>

            <div className="xp-start-menu__body">
              {/* Sol Taraf: Uygulamalar */}
              <div className="xp-start-menu__left">
                <button
                  className="xp-start-menu__item"
                  onClick={() => { onOpenApp('terminal'); setStartOpen(false); }}
                >
                  <span className="xp-start-menu__icon">⌨️</span>
                  <div>
                    <strong>Terminal</strong>
                    <small>Komut Satırı & Docker</small>
                  </div>
                </button>

                <button
                  className="xp-start-menu__item"
                  onClick={() => { onOpenApp('explorer'); setStartOpen(false); }}
                >
                  <span className="xp-start-menu__icon">📁</span>
                  <div>
                    <strong>Dosya Gezgini</strong>
                    <small>Belgelerim & Projeler</small>
                  </div>
                </button>

                <button
                  className="xp-start-menu__item"
                  onClick={() => { onOpenApp('editor'); setStartOpen(false); }}
                >
                  <span className="xp-start-menu__icon">📝</span>
                  <div>
                    <strong>Kod Editörü</strong>
                    <small>Dockerfile & Manifestler</small>
                  </div>
                </button>

                <button
                  className="xp-start-menu__item"
                  onClick={() => { onOpenApp('browser_chrome'); setStartOpen(false); }}
                >
                  <span className="xp-start-menu__icon">🌐</span>
                  <div>
                    <strong>Google Chrome</strong>
                    <small>Oyun İçi Tarayıcı</small>
                  </div>
                </button>

                <button
                  className="xp-start-menu__item"
                  onClick={() => { onOpenApp('monitoring'); setStartOpen(false); }}
                >
                  <span className="xp-start-menu__icon">📊</span>
                  <div>
                    <strong>Monitoring</strong>
                    <small>Kaynak Kullanımı İzleme</small>
                  </div>
                </button>

                <button
                  className="xp-start-menu__item"
                  onClick={() => { setScene('jobplatform'); setStartOpen(false); }}
                >
                  <span className="xp-start-menu__icon">💼</span>
                  <div>
                    <strong>İş Platformu</strong>
                    <small>LinkedIn / İlanlar</small>
                  </div>
                </button>
              </div>

              {/* Sağ Taraf: Kısayollar */}
              <div className="xp-start-menu__right">
                <div
                  className="xp-start-menu__link"
                  onClick={() => { onOpenApp('explorer'); setStartOpen(false); }}
                >
                  📁 Belgelerim
                </div>
                <div
                  className="xp-start-menu__link"
                  onClick={() => { onOpenApp('tutorials'); setStartOpen(false); }}
                >
                  📚 Tutorial Hub
                </div>
                <div
                  className="xp-start-menu__link"
                  onClick={() => { onOpenApp('browser_edge'); setStartOpen(false); }}
                >
                  🌐 Microsoft Edge
                </div>
              </div>
            </div>

            {/* Alt Taraf: Kapat Butonu */}
            <div className="xp-start-menu__footer">
              <button className="xp-shutdown-btn" onClick={handleShutdown}>
                <span className="xp-shutdown-btn__icon">⭕</span>
                <span>Bilgisayarı Kapat</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ortada: Açık Pencereler */}
      <div className="xp-taskbar__windows">
        {openWindows.map((win) => {
          const isActive = focusedWindowId === win.id && !win.isMinimized;
          return (
            <button
              key={win.id}
              className={`xp-taskbar-item ${isActive ? 'xp-taskbar-item--active' : ''}`}
              onClick={() => onWindowClick(win.id)}
            >
              <span className="xp-taskbar-item__icon">{win.icon}</span>
              <span className="xp-taskbar-item__title">{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* Sağ Altta: Saat & Tray */}
      <div className="xp-taskbar__tray">
        <span className="xp-taskbar__tray-icon">🔊</span>
        <span className="xp-taskbar__tray-icon">🛡️</span>
        <div className="xp-taskbar__clock" title={`Oyun Günü: ${dayCount}`}>
          {currentTime}
        </div>
      </div>
    </div>
  );
}
