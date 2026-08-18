/**
 * StoreScene.jsx — Mağaza ve Yaşam Tarzı Sahnesi (Faz 13)
 *
 * Oyuncunun para harcayarak Yaşam Tarzı (Lifestyle) barını besleyen
 * giyim, kozmetik, ev eşyası ve sanat ürünleri satın alabileceği mağaza sahnesi.
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import { STORE } from '../config/gameBalance.config.js';
import './StoreScene.css';

export default function StoreScene() {
  const setScene = useGameStore((s) => s.setScene);
  const balance = useGameStore((s) => s.finance.balance);
  const lifestyle = useGameStore((s) => s.bars.lifestyle?.current ?? 50);
  const buyStoreItem = useGameStore((s) => s.buyStoreItem);
  const itemsOwned = useGameStore((s) => s.inventory.items || []);

  const [activeCategory, setActiveCategory] = useState('clothing');
  const [feedback, setFeedback] = useState(null);

  const categories = STORE.CATEGORIES;
  const currentItems = STORE.ITEMS[activeCategory] || [];

  const handlePurchase = (item) => {
    const res = buyStoreItem(item);
    if (res.success) {
      setFeedback({ type: 'success', message: `✅ ${item.name} satın alındı! (+${item.lifestyleBonus} Yaşam Tarzı)` });
    } else {
      setFeedback({ type: 'error', message: `❌ ${res.message}` });
    }

    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  return (
    <div className="scene scene--store">
      <div className="store-header">
        <button className="store-back" onClick={() => setScene('outdoor')}>
          ← Dışarı Dön
        </button>
        <div className="store-title-wrap">
          <h2>🛍️ MLOps Yaşam Tarzı Mağazası</h2>
          <span className="store-subtitle">Kişisel stil, konfor ve sosyal karizmanızı yükseltin</span>
        </div>
        <div className="store-stats">
          <span className="store-stat-chip">💰 ₺{Math.floor(balance).toLocaleString('tr-TR')}</span>
          <span className="store-stat-chip store-stat-chip--lifestyle">✨ Yaşam Tarzı: %{Math.round(lifestyle)}</span>
        </div>
      </div>

      {feedback && (
        <div className={`store-alert store-alert--${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* Kategori Sekmeleri */}
      <div className="store-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`store-cat-btn ${activeCategory === cat.id ? 'store-cat-btn--active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="store-cat-btn__icon">{cat.icon}</span>
            <span className="store-cat-btn__name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Ürün Listesi */}
      <div className="store-grid">
        {currentItems.map((item) => {
          const canAfford = balance >= item.price;
          const countOwned = itemsOwned.filter((id) => id === item.id).length;

          return (
            <div key={item.id} className="store-card">
              <div className="store-card__header">
                <span className="store-card__icon">{item.icon}</span>
                <div className="store-card__title-wrap">
                  <h3 className="store-card__title">{item.name}</h3>
                  <span className="store-card__badge">+{item.lifestyleBonus} Yaşam Tarzı</span>
                </div>
              </div>

              <p className="store-card__desc">{item.description}</p>

              <div className="store-card__footer">
                <div className="store-card__price-wrap">
                  <span className="store-card__price">₺{item.price}</span>
                  {countOwned > 0 && (
                    <span className="store-card__owned-tag">Sahipsiniz ({countOwned})</span>
                  )}
                </div>

                <button
                  className={`store-card__buy-btn ${!canAfford ? 'store-card__buy-btn--disabled' : ''}`}
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford}
                >
                  {canAfford ? 'Satın Al' : 'Yetersiz Bakiye'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
