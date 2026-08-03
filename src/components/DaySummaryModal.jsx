/**
 * DaySummaryModal.jsx — Gün sonu özet ekranı
 *
 * Her gün bittiğinde gösterilir. Günün istatistiklerini, yaşanan olayları
 * ve kariyer puanını özetler.
 */

import useGameStore from '../store/useGameStore';
import './DaySummaryModal.css';

export default function DaySummaryModal({ onClose }) {
  const dayCount = useGameStore((s) => s.dayCount);
  const bars = useGameStore((s) => s.bars);
  const balance = useGameStore((s) => s.finance.balance);
  const todayEvents = useGameStore((s) => s.todayEvents);
  const character = useGameStore((s) => s.character);

  return (
    <div className="modal-overlay">
      <div className="modal day-summary-modal">
        <div className="modal__header">
          <h3>📋 Gün {dayCount} — Özet</h3>
        </div>

        <div className="modal__body">
          {/* Bar durumları */}
          <div className="day-summary__section">
            <h4>Durum</h4>
            <div className="day-summary__stats">
              <div className="day-summary__stat">
                <span>😴 Uyku</span>
                <span>{Math.round(bars.sleep.current)}%</span>
              </div>
              <div className="day-summary__stat">
                <span>🍔 Açlık</span>
                <span>{Math.round(bars.hunger.current)}%</span>
              </div>
              <div className="day-summary__stat">
                <span>❤️ Sağlık</span>
                <span>{Math.round(bars.health.current)}%</span>
              </div>
              <div className="day-summary__stat">
                <span>😰 Stres</span>
                <span>{Math.round(bars.stress.current)}%</span>
              </div>
            </div>
          </div>

          {/* Finans */}
          <div className="day-summary__section">
            <h4>💰 Finans</h4>
            <p>Bakiye: ₺{Math.floor(balance).toLocaleString('tr-TR')}</p>
          </div>

          {/* Kariyer */}
          <div className="day-summary__section">
            <h4>🎯 Kariyer</h4>
            <p>Rütbe: {character.rank}</p>
            <p>Kariyer Puanı: {character.careerPoints}</p>
          </div>

          {/* Günün olayları */}
          {todayEvents.length > 0 && (
            <div className="day-summary__section">
              <h4>📝 Günün Olayları</h4>
              <ul className="day-summary__events">
                {todayEvents.map((event, i) => (
                  <li key={i}>{event}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="day-summary__footer">
          <button className="day-summary__next-btn" onClick={onClose}>
            Yeni Güne Başla →
          </button>
        </div>
      </div>
    </div>
  );
}
