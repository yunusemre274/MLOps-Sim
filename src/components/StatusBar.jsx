/**
 * StatusBar.jsx — Tek bir barın görsel gösterimi
 *
 * Animasyonlu doluluk çubuğu. Bar durumuna göre renk değiştirir.
 * Kritik seviyede titreşim animasyonu.
 */

import { getBarStatus } from '../engine/BarEngine';
import './StatusBar.css';

const BAR_ICONS = {
  sleep:  '😴',
  hunger: '🍔',
  health: '❤️',
  stress: '😰',
};

const BAR_LABELS = {
  sleep:  'Uyku',
  hunger: 'Açlık',
  health: 'Sağlık',
  stress: 'Stres',
};

export default function StatusBar({ barName, current, max }) {
  const percentage = Math.round((current / max) * 100);
  const status = getBarStatus(current, barName);

  return (
    <div
      className={`status-bar status-bar--${status}`}
      title={`${BAR_LABELS[barName]}: ${percentage}%`}
      role="progressbar"
      aria-label={BAR_LABELS[barName]}
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="status-bar__header">
        <span className="status-bar__icon" aria-hidden="true">{BAR_ICONS[barName]}</span>
        <span className="status-bar__label">{BAR_LABELS[barName]}</span>
        <span className="status-bar__value">{percentage}%</span>
      </div>
      <div className="status-bar__track">
        <div
          className={`status-bar__fill status-bar__fill--${barName}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
