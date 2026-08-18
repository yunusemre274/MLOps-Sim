/**
 * PhoneControlCenter.jsx — iOS 26 Liquid Glass Kontrol Paneli
 *
 * İşlevsel parlaklık slider'ı ve hızlı sistem toggle'ları.
 */

import useGameStore from '../../store/useGameStore';
import './PhoneControlCenter.css';

export default function PhoneControlCenter({ onClose }) {
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
    <div className="phone-control-center-backdrop" onClick={onClose}>
      <div className="phone-control-center" onClick={(e) => e.stopPropagation()}>
        <div className="pcc-handle-bar" onClick={onClose} />

        <div className="pcc-grid">
          {/* Bağlantı Grubu (2x2) */}
          <div className="pcc-tile pcc-tile--connectivity">
            <button
              className={`pcc-icon-btn ${phoneSettings.airplaneMode ? 'pcc-icon-btn--active' : ''}`}
              onClick={() => togglePhoneSetting('airplaneMode')}
              title="Uçak Modu"
            >
              ✈️
            </button>
            <button
              className={`pcc-icon-btn ${phoneSettings.wifi ? 'pcc-icon-btn--active' : ''}`}
              onClick={() => togglePhoneSetting('wifi')}
              title="Wi-Fi"
            >
              📶
            </button>
            <button
              className={`pcc-icon-btn ${phoneSettings.bluetooth ? 'pcc-icon-btn--active' : ''}`}
              onClick={() => togglePhoneSetting('bluetooth')}
              title="Bluetooth"
            >
              ᛒ
            </button>
            <button
              className="pcc-icon-btn pcc-icon-btn--active"
              title="Hücresel Veri (5G)"
            >
              📡
            </button>
          </div>

          {/* Müzik Oynatıcı Kartı */}
          <div className="pcc-tile pcc-tile--music">
            <span className="pcc-music-icon">🎵</span>
            <div className="pcc-music-info">
              <strong>MLOps Lofi Beats</strong>
              <span>Spotify Mobile</span>
            </div>
            <div className="pcc-music-controls">
              <span>⏮️</span>
              <span>▶️</span>
              <span>⏭️</span>
            </div>
          </div>

          {/* Parlaklık Slider'ı (ZORUNLU İŞLEVSEL) */}
          <div className="pcc-slider-card">
            <div className="pcc-slider-fill" style={{ height: `${phoneSettings.brightness}%` }} />
            <input
              type="range"
              min="20"
              max="100"
              value={phoneSettings.brightness}
              onChange={(e) => setPhoneBrightness(parseInt(e.target.value, 10))}
              className="pcc-vertical-slider"
            />
            <span className="pcc-slider-icon">☀️</span>
            <span className="pcc-slider-val">%{phoneSettings.brightness}</span>
          </div>

          {/* Ses Slider'ı */}
          <div className="pcc-slider-card">
            <div className="pcc-slider-fill pcc-slider-fill--volume" style={{ height: `${phoneSettings.volume}%` }} />
            <span className="pcc-slider-icon">🔊</span>
            <span className="pcc-slider-val">%{phoneSettings.volume}</span>
          </div>

          {/* Hızlı Butonlar */}
          <button
            className={`pcc-quick-btn ${phoneSettings.flashlight ? 'pcc-quick-btn--active' : ''}`}
            onClick={() => togglePhoneSetting('flashlight')}
            title="El Feneri"
          >
            🔦
          </button>
          <button className="pcc-quick-btn" title="Kamera">
            📷
          </button>
          <button className="pcc-quick-btn" title="Hesap Makinesi">
            🧮
          </button>
          <button className="pcc-quick-btn" title="Odaklanma Modu">
            🌙
          </button>
        </div>

        <button className="pcc-close-hint" onClick={onClose}>
          ✕ Kapatmak için dokunun veya yukarı kaydırın
        </button>
      </div>
    </div>
  );
}
