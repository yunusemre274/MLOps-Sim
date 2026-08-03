/**
 * FridgeModal.jsx — Buzdolabı görüntüleme ve yemek yeme modalı
 *
 * Buzdolabındaki yiyecekleri listeler. Tıklanan yiyecek yenir ve stoktan düşer.
 * Buzdolabı boşsa uyarı mesajı gösterir.
 */

import { FINANCE } from '../config/gameBalance.config.js';
import './FridgeModal.css';

const FOOD_ICONS = {
  bread: '🍞',
  eggs: '🥚',
  cheese: '🧀',
  chicken: '🍗',
  vegetables: '🥗',
  fruit: '🍎',
  milk: '🥛',
  rice: '🍚',
  water: '💧',
  energy_drink: '⚡',
};

export default function FridgeModal({ items, onEat, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fridge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>🧊 Buzdolabı</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          {items.length === 0 ? (
            <div className="fridge-modal__empty">
              <span className="fridge-modal__empty-icon">📭</span>
              <p>Buzdolabın boş!</p>
              <p className="fridge-modal__hint">
                Marketten yiyecek al → kapıdan çık ve markete git.
              </p>
            </div>
          ) : (
            <div className="fridge-modal__items">
              {items.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  className="fridge-modal__food"
                  onClick={() => onEat(index)}
                  title={`${item} ye — açlık +${BARS_EAT_EFFECT}`}
                >
                  <span className="fridge-modal__food-icon">
                    {FOOD_ICONS[item] || '🍽️'}
                  </span>
                  <span className="fridge-modal__food-name">{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Yemek yemenin açlık etkisi (UI'da göstermek için)
const BARS_EAT_EFFECT = 25;
