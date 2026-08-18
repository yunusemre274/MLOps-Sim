/**
 * PhoneSettingsApp.jsx — Telefon Ayarları Uygulaması
 *
 * İşlevsel ekran parlaklığı kontrolü (slider) ve sistem ayarları.
 */

import useGameStore from '../../store/useGameStore';
import './PhoneSettingsApp.css';

export default function PhoneSettingsApp() {
  const phoneSettings = useGameStore((s) => s.phoneSettings) || {
    brightness: 100,
    wifi: true,
    bluetooth: true,
    airplaneMode: false,
    volume: 80,
    flashlight: false,
  };
  const setPhoneBrightness = useGameStore((s) => s.setPhoneBrightness);
  const togglePhoneSetting = useGameStore((s) => s.togglePhoneSetting);

  return (
    <div className="phone-settings-app">
      {/* Üst Bar */}
      <div className="psa-header">
        <div className="psa-brand">
          <span className="psa-logo">⚙️</span>
          <h3>Ayarlar</h3>
        </div>
      </div>

      <div className="psa-body">
        {/* Kullanıcı Profili */}
        <div className="psa-user-card">
          <div className="psa-avatar">👨‍💻</div>
          <div className="psa-user-info">
            <strong>MLOps Mühendisi</strong>
            <span>Apple ID, iCloud+ ve Medya</span>
          </div>
        </div>

        {/* Ekran ve Parlaklık (ZORUNLU İŞLEVSEL SLIDER) */}
        <div className="psa-section">
          <div className="psa-section-title">EKRAN VE PARLAKLIK</div>
          <div className="psa-card">
            <div className="psa-brightness-row">
              <div className="psa-b-label">
                <span>☀️ Parlaklık</span>
                <strong>%{phoneSettings.brightness}</strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={phoneSettings.brightness}
                onChange={(e) => setPhoneBrightness(parseInt(e.target.value, 10))}
                className="psa-slider"
              />
              <span className="psa-slider-hint">Slider sola çekildikçe ekran gerçekçi şekilde kararır.</span>
            </div>
          </div>
        </div>

        {/* Ağ ve Bağlantılar */}
        <div className="psa-section">
          <div className="psa-section-title">BAĞLANTILAR</div>
          <div className="psa-card">
            <div className="psa-toggle-row" onClick={() => togglePhoneSetting('wifi')}>
              <div className="psa-row-left">
                <span className="psa-icon psa-icon--blue">📶</span>
                <span>Wi-Fi (MLOps-Mesh-5G)</span>
              </div>
              <span className="psa-toggle-status">{phoneSettings.wifi ? 'Açık' : 'Kapalı'}</span>
            </div>

            <div className="psa-toggle-row" onClick={() => togglePhoneSetting('bluetooth')}>
              <div className="psa-row-left">
                <span className="psa-icon psa-icon--blue">ᛒ</span>
                <span>Bluetooth</span>
              </div>
              <span className="psa-toggle-status">{phoneSettings.bluetooth ? 'Açık' : 'Kapalı'}</span>
            </div>

            <div className="psa-toggle-row" onClick={() => togglePhoneSetting('airplaneMode')}>
              <div className="psa-row-left">
                <span className="psa-icon psa-icon--orange">✈️</span>
                <span>Uçak Modu</span>
              </div>
              <span className="psa-toggle-status">{phoneSettings.airplaneMode ? 'Açık' : 'Kapalı'}</span>
            </div>
          </div>
        </div>

        {/* Cihaz Bilgisi */}
        <div className="psa-section">
          <div className="psa-section-title">CİHAZ HAKKINDA</div>
          <div className="psa-card">
            <div className="psa-info-row">
              <span>Model Adı</span>
              <strong>MLOps Phone 16 Pro</strong>
            </div>
            <div className="psa-info-row">
              <span>Yazılım Sürümü</span>
              <strong>Liquid Glass iOS 26.1</strong>
            </div>
            <div className="psa-info-row">
              <span>Depolama</span>
              <strong>512 GB NVMe SSD</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
