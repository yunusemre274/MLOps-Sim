/**
 * MarketScene.jsx — Market sahnesi
 * Yiyecek satın alıp buzdolabına ekleme.
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import { FINANCE, TIME } from '../config/gameBalance.config.js';
import { advanceTime } from '../engine/TimeEngine';
import InteractiveItem from '../components/InteractiveItem';
import './MarketScene.css';

const MARKET_ITEMS = Object.entries(FINANCE.MARKET_PRICES).map(([id, price]) => ({
  id,
  price,
}));

const FOOD_ICONS = {
  bread: '🍞', eggs: '🥚', cheese: '🧀', chicken: '🍗',
  vegetables: '🥗', fruit: '🍎', milk: '🥛', rice: '🍚',
  water: '💧', energy_drink: '⚡',
};

export default function MarketScene({ isOnline = false, onBack }) {
  const setScene = useGameStore((s) => s.setScene);
  const balance = useGameStore((s) => s.finance.balance);
  const [bought, setBought] = useState([]);

  const markup = isOnline ? FINANCE.ONLINE_MARKET_MARKUP : 1.0;

  const handleBuy = (item) => {
    const cost = Math.ceil(item.price * markup);
    const state = useGameStore.getState();

    if (state.finance.balance < cost) return;

    useGameStore.setState({
      finance: { ...state.finance, balance: state.finance.balance - cost },
    });
    useGameStore.getState().addToFridge(item.id);
    setBought((prev) => [...prev, item.id]);
  };

  const handleLeave = () => {
    // Zaman tüketimi (sadece fiziksel market)
    if (!isOnline) {
      const state = useGameStore.getState();
      const { newTime } = advanceTime(state.currentTime, TIME.ACTIONS.goToMarket);
      useGameStore.setState({ currentTime: newTime });
    }
    useGameStore.getState().addEvent(`${isOnline ? 'Online' : ''} Market alışverişi yapıldı (${bought.length} ürün)`);

    if (onBack) {
      onBack();
    } else {
      setScene(isOnline ? 'phone' : 'outdoor');
    }
  };

  return (
    <div className={`scene scene--market ${isOnline ? 'scene--market-online' : ''}`}>
      <div className="market-header">
        <button className="location-back" onClick={handleLeave}>
          ← {isOnline ? 'Rehbere Dön' : 'Geri'}
        </button>
        <h2>{isOnline ? '📦 GetirMLOps' : '🏪 Market'}</h2>
        <span className="market-balance">💰 ₺{Math.floor(balance)}</span>
      </div>

      {isOnline && (
        <p className="market-markup-notice">
          ⚠️ Online fiyatlar %{Math.round((FINANCE.ONLINE_MARKET_MARKUP - 1) * 100)} daha pahalı
        </p>
      )}

      <div className="market-grid">
        {MARKET_ITEMS.map((item) => {
          const cost = Math.ceil(item.price * markup);
          const canAfford = balance >= cost;
          return (
            <button
              key={item.id}
              className={`market-item ${!canAfford ? 'market-item--disabled' : ''}`}
              onClick={() => handleBuy(item)}
              disabled={!canAfford}
            >
              <span className="market-item__icon">{FOOD_ICONS[item.id] || '🍽️'}</span>
              <span className="market-item__name">{item.id}</span>
              <span className="market-item__price">₺{cost}</span>
            </button>
          );
        })}
      </div>

      {bought.length > 0 && (
        <div className="market-cart">
          🛒 {bought.length} ürün alındı
        </div>
      )}
    </div>
  );
}
