/**
 * PhoneScene.jsx — iOS 26 Liquid Glass Telefon Sahnesi (Faz 14)
 *
 * Özellikler:
 * - iOS 26 Liquid Glass cam efektli tasarım dili (translucency, blur, depth shadows)
 * - Durum çubuğu (Oyun saatiyle senkron, Dynamic Island, 5G, Wi-Fi, Batarya)
 * - Hava Durumu widget'ı (gün/saat bazlı dinamik simülasyon)
 * - 10 Uygulama: LinkedIn, WhatsApp, Telefon, Mesajlar, Online Market, Spotify (dekoratif), Gmail, Jobs, Banka, Ayarlar
 * - Sabit Dock (4 ana uygulama)
 * - Kontrol Paneli (İşlevsel parlaklık slider'ı ve hızlı toggle'lar)
 * - Bildirim Merkezi (Merkezi kronolojik bildirimler ve doğrudan uygulama yönlendirme)
 * - Home Indicator / Eve Dönüş
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';

import PhoneWeatherWidget from '../components/phone/PhoneWeatherWidget';
import PhoneLinkedInApp from '../components/phone/PhoneLinkedInApp';
import PhoneWhatsAppApp from '../components/phone/PhoneWhatsAppApp';
import PhoneCallApp from '../components/phone/PhoneCallApp';
import PhoneMessagesApp from '../components/phone/PhoneMessagesApp';
import PhoneMarketApp from '../components/phone/PhoneMarketApp';
import PhoneGmailApp from '../components/phone/PhoneGmailApp';
import PhoneJobApp from '../components/phone/PhoneJobApp';
import PhoneBankApp from '../components/phone/PhoneBankApp';
import PhoneSettingsApp from '../components/phone/PhoneSettingsApp';
import PhoneControlCenter from '../components/phone/PhoneControlCenter';
import PhoneNotificationCenter from '../components/phone/PhoneNotificationCenter';

import './PhoneScene.css';

const APP_GRID = [
  { id: 'jobs', name: 'DevJobs', icon: '💼', color: 'linear-gradient(135deg, #007aff, #0056b3)' },
  { id: 'linkedin', name: 'LinkedIn', icon: '🌐', color: 'linear-gradient(135deg, #0a66c2, #004182)' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'linear-gradient(135deg, #25D366, #128C7E)' },
  { id: 'call', name: 'Telefon', icon: '📞', color: 'linear-gradient(135deg, #34C759, #248A3D)' },
  { id: 'messages', name: 'Mesajlar', icon: '✉️', color: 'linear-gradient(135deg, #5856D6, #3634A3)' },
  { id: 'market', name: 'GetirMLOps', icon: '🛵', color: 'linear-gradient(135deg, #5E35B1, #311B92)' },
  { id: 'bank', name: 'DevBank', icon: '🏦', color: 'linear-gradient(135deg, #00D2FF, #0072FF)' },
  { id: 'gmail', name: 'Gmail', icon: '📧', color: 'linear-gradient(135deg, #EA4335, #C5221F)' },
  { id: 'spotify', name: 'Spotify', icon: '🎵', color: 'linear-gradient(135deg, #1DB954, #14833B)', isDecorative: true },
  { id: 'settings', name: 'Ayarlar', icon: '⚙️', color: 'linear-gradient(135deg, #8E8E93, #636366)' },
];

const DOCK_APPS = [
  { id: 'call', name: 'Telefon', icon: '📞', color: 'linear-gradient(135deg, #34C759, #248A3D)' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'linear-gradient(135deg, #25D366, #128C7E)' },
  { id: 'messages', name: 'Mesajlar', icon: '✉️', color: 'linear-gradient(135deg, #5856D6, #3634A3)' },
  { id: 'jobs', name: 'Jobs', icon: '💼', color: 'linear-gradient(135deg, #007aff, #0056b3)' },
];

export default function PhoneScene() {
  const setScene = useGameStore((s) => s.setScene);
  const currentTime = useGameStore((s) => s.currentTime);
  const notifications = useGameStore((s) => s.notifications) || [];
  const phoneSettings = useGameStore((s) => s.phoneSettings) || { brightness: 100 };

  const [activeApp, setActiveApp] = useState(null); // null (home) | app id
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAppClick = (app) => {
    if (app.isDecorative || app.id === 'spotify') {
      showToast('🎵 Spotify: Yakında MLOps Lofi Beats ile sizlerle!');
      return;
    }
    setActiveApp(app.id);
  };

  const handleHomeClick = () => {
    if (activeApp) {
      setActiveApp(null);
    } else {
      setScene('home');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Parlaklık karartma katmanı opaklığı (%20 parlaklıkta ~0.80 kararır, %100 parlaklıkta 0)
  const brightness = phoneSettings.brightness || 100;
  const overlayOpacity = Math.max(0, Math.min(0.8, (100 - brightness) * 0.01));

  const renderActiveApp = () => {
    switch (activeApp) {
      case 'jobs':
        return <PhoneJobApp />;
      case 'linkedin':
        return <PhoneLinkedInApp />;
      case 'whatsapp':
        return <PhoneWhatsAppApp />;
      case 'call':
        return <PhoneCallApp />;
      case 'messages':
        return <PhoneMessagesApp />;
      case 'market':
        return <PhoneMarketApp />;
      case 'gmail':
        return <PhoneGmailApp />;
      case 'bank':
        return <PhoneBankApp />;
      case 'settings':
        return <PhoneSettingsApp />;
      default:
        return null;
    }
  };

  return (
    <div className="phone-scene-wrapper">
      {/* Üst Dış Bar */}
      <div className="phone-external-header">
        <button className="phone-back-to-room" onClick={() => setScene('home')}>
          ← Odaya Dön
        </button>
        <span className="phone-device-tag">📱 MLOps Phone 16 Pro (Liquid Glass iOS 26)</span>
      </div>

      {/* Telefon Gövdesi (Hardware Bezel) */}
      <div className="phone-hardware-frame">
        {/* İşlevsel Parlaklık Karartma Katmanı */}
        <div
          className="phone-brightness-overlay"
          style={{ opacity: overlayOpacity }}
        />

        {/* Dynamic Island / Üst Hoparlör */}
        <div className="phone-notch">
          <div className="phone-dynamic-island">
            <span className="phone-camera-lens" />
            <span className="phone-sensor" />
          </div>
        </div>

        {/* Durum Çubuğu (Status Bar) */}
        <div className="phone-status-bar">
          <div
            className="phone-status-left"
            onClick={() => setShowNotificationCenter(true)}
            title="Bildirim Merkezi için dokunun"
          >
            <span className="phone-clock">{currentTime}</span>
            {unreadCount > 0 && <span className="phone-notif-dot" title={`${unreadCount} yeni bildirim`}>●</span>}
          </div>

          <div
            className="phone-status-right"
            onClick={() => setShowControlCenter(true)}
            title="Kontrol Paneli için dokunun"
          >
            <span className="phone-signal">5G</span>
            <span className="phone-wifi">📶</span>
            <span className="phone-battery">98% 🔋</span>
          </div>
        </div>

        {/* Toast Mesajı */}
        {toast && <div className="phone-global-toast">{toast}</div>}

        {/* Kontrol Paneli Katmanı */}
        {showControlCenter && (
          <PhoneControlCenter onClose={() => setShowControlCenter(false)} />
        )}

        {/* Bildirim Merkezi Katmanı */}
        {showNotificationCenter && (
          <PhoneNotificationCenter
            onClose={() => setShowNotificationCenter(false)}
            onOpenApp={(appId) => {
              setShowNotificationCenter(false);
              setActiveApp(appId);
            }}
          />
        )}

        {/* Ekran İçeriği */}
        <div className="phone-screen-content">
          {activeApp ? (
            /* Aktif Uygulama Ekranı */
            <div className="phone-app-container">
              {renderActiveApp()}
            </div>
          ) : (
            /* Ana Ekran (Home Screen) */
            <div className="phone-home-screen">
              {/* Hava Durumu Widget'ı */}
              <PhoneWeatherWidget />

              {/* Uygulama Izgarası */}
              <div className="phone-app-grid">
                {APP_GRID.map((app) => (
                  <div
                    key={app.id}
                    className="phone-app-icon-item"
                    onClick={() => handleAppClick(app)}
                  >
                    <div
                      className="phone-app-icon-box"
                      style={{ background: app.color }}
                    >
                      <span className="phone-app-icon-symbol">{app.icon}</span>
                    </div>
                    <span className="phone-app-icon-label">{app.name}</span>
                  </div>
                ))}
              </div>

              {/* Sabit Dock (Alt Çekmece) */}
              <div className="phone-dock">
                {DOCK_APPS.map((app) => (
                  <div
                    key={app.id}
                    className="phone-dock-icon-item"
                    onClick={() => handleAppClick(app)}
                  >
                    <div
                      className="phone-app-icon-box phone-app-icon-box--dock"
                      style={{ background: app.color }}
                    >
                      <span className="phone-app-icon-symbol">{app.icon}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alt Home Çizgisi (Home Indicator) */}
        <div className="phone-home-bar-area" onClick={handleHomeClick}>
          <div className="phone-home-indicator" />
        </div>
      </div>
    </div>
  );
}
