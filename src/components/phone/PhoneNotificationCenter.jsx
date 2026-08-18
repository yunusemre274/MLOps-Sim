/**
 * PhoneNotificationCenter.jsx — iOS 26 Liquid Glass Bildirim Merkezi
 *
 * Tüm uygulamalardan gelen bildirimlerin kronolojik listesi ve doğrudan ilgili uygulamaya yönlendirme.
 */

import useGameStore from '../../store/useGameStore';
import './PhoneNotificationCenter.css';

export default function PhoneNotificationCenter({ onClose, onOpenApp }) {
  const notifications = useGameStore((s) => s.notifications) || [];
  const clearNotifications = useGameStore((s) => s.clearNotifications);
  const markNotificationRead = useGameStore((s) => s.markNotificationRead);
  const currentTime = useGameStore((s) => s.currentTime);
  const dayCount = useGameStore((s) => s.dayCount);

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    onClose();
    if (onOpenApp && notif.onTapApp) {
      onOpenApp(notif.onTapApp, notif.onTapPayload);
    }
  };

  return (
    <div className="phone-notification-center-backdrop" onClick={onClose}>
      <div className="phone-notification-center" onClick={(e) => e.stopPropagation()}>
        <div className="pnc-handle-bar" onClick={onClose} />

        {/* Üst Tarih & Saat */}
        <div className="pnc-date-header">
          <div className="pnc-clock">{currentTime}</div>
          <div className="pnc-day-label">Gün {dayCount} • MLOps OS</div>
        </div>

        {/* Bildirim Başlığı & Temizle */}
        <div className="pnc-title-row">
          <h4>Bildirim Merkezi</h4>
          {notifications.length > 0 && (
            <button className="pnc-clear-btn" onClick={clearNotifications}>
              Tümünü Temizle
            </button>
          )}
        </div>

        {/* Bildirim Listesi */}
        <div className="pnc-list">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`pnc-card ${notif.read ? 'pnc-card--read' : 'pnc-card--unread'}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="pnc-card-header">
                  <div className="pnc-card-app">
                    <span className="pnc-app-icon">{notif.icon || '🔔'}</span>
                    <strong>{notif.title}</strong>
                  </div>
                  <span className="pnc-card-time">{notif.time || 'Şimdi'}</span>
                </div>
                <p className="pnc-card-body">{notif.body}</p>
              </div>
            ))
          ) : (
            <div className="pnc-empty">
              <span className="pnc-empty-icon">✨</span>
              <p>Yeni bildiriminiz yok.</p>
            </div>
          )}
        </div>

        <button className="pnc-close-hint" onClick={onClose}>
          ✕ Kapatmak için dokunun
        </button>
      </div>
    </div>
  );
}
