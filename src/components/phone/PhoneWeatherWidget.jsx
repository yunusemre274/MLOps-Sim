/**
 * PhoneWeatherWidget.jsx — iOS 26 Liquid Glass Hava Durumu Widget'ı
 *
 * Oyun içi gün ve saate bağlı olarak simüle edilen dinamik hava durumu kartı.
 */

import useGameStore from '../../store/useGameStore';
import './PhoneWeatherWidget.css';

export default function PhoneWeatherWidget() {
  const dayCount = useGameStore((s) => s.dayCount);
  const currentTime = useGameStore((s) => s.currentTime);
  const weather = useGameStore((s) => s.weather) || {
    city: 'Neo-İstanbul',
    temp: 24,
    condition: 'sunny',
    label: 'Güneşli',
    icon: '☀️',
    high: 27,
    low: 18,
  };

  // Gün döngüsüne göre hava durumu simülasyonu
  const conditions = [
    { label: 'Güneşli', icon: '☀️', tempOffset: 2, high: 28, low: 19 },
    { label: 'Parçalı Bulutlu', icon: '⛅', tempOffset: -1, high: 24, low: 17 },
    { label: 'Açık / Rüzgarlı', icon: '🌤️', tempOffset: 0, high: 25, low: 18 },
    { label: 'Hafif Yağmurlu', icon: '🌧️', tempOffset: -4, high: 20, low: 14 },
    { label: 'Bulutlu', icon: '☁️', tempOffset: -2, high: 22, low: 16 },
  ];

  const currentCond = conditions[(dayCount - 1) % conditions.length];
  const hour = parseInt(currentTime.split(':')[0], 10) || 12;
  const isNight = hour >= 21 || hour < 6;

  const displayTemp = weather.temp + currentCond.tempOffset - (isNight ? 5 : 0);
  const displayIcon = isNight ? '🌙' : currentCond.icon;
  const displayLabel = isNight ? 'Açık Gece' : currentCond.label;

  return (
    <div className="phone-weather-widget">
      <div className="pww-header">
        <div>
          <span className="pww-city">{weather.city}</span>
          <span className="pww-day">Gün {dayCount} • {currentTime}</span>
        </div>
        <span className="pww-icon">{displayIcon}</span>
      </div>

      <div className="pww-body">
        <div className="pww-temp">{displayTemp}°</div>
        <div className="pww-details">
          <span className="pww-label">{displayLabel}</span>
          <span className="pww-range">Y:{currentCond.high}° D:{currentCond.low}°</span>
        </div>
      </div>

      <div className="pww-forecast">
        <div className="pww-f-item">
          <span>Şimdi</span>
          <span>{displayIcon}</span>
          <span>{displayTemp}°</span>
        </div>
        <div className="pww-f-item">
          <span>+2s</span>
          <span>{isNight ? '🌙' : '☀️'}</span>
          <span>{displayTemp + 1}°</span>
        </div>
        <div className="pww-f-item">
          <span>+4s</span>
          <span>⛅</span>
          <span>{displayTemp - 1}°</span>
        </div>
        <div className="pww-f-item">
          <span>+6s</span>
          <span>🌧️</span>
          <span>{displayTemp - 3}°</span>
        </div>
      </div>
    </div>
  );
}
