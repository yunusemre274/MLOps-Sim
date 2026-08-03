/**
 * RealtorScene.jsx — Emlakçı sahnesi
 * Ev listeleme, ev yükseltme (barRecoveryMultiplier), kira güncelleme.
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import { FINANCE } from '../config/gameBalance.config.js';
import './RealtorScene.css';

const HOUSING_LIST = Object.entries(FINANCE.HOUSING).map(([id, data]) => ({
  id,
  rent: data.rent,
  recovery: data.recoveryMultiplier,
}));

const HOUSING_LABELS = {
  starter_apartment: { icon: '🏚️', name: 'Başlangıç Dairesi' },
  mid_apartment:     { icon: '🏠', name: 'Orta Daire' },
  nice_apartment:    { icon: '🏡', name: 'Güzel Daire' },
  luxury_apartment:  { icon: '🏢', name: 'Lüks Daire' },
};

export default function RealtorScene() {
  const setScene = useGameStore((s) => s.setScene);
  const currentHome = useGameStore((s) => s.housing.currentHome);
  const balance = useGameStore((s) => s.finance.balance);
  const [message, setMessage] = useState(null);

  const handleMove = (housing) => {
    if (housing.id === currentHome) {
      setMessage('Zaten bu evde yaşıyorsun!');
      return;
    }

    // İlk ay kira + depozito (2x kira)
    const moveCost = housing.rent * 2;
    if (balance < moveCost) {
      setMessage(`Taşınma maliyeti ₺${moveCost} — yeterli paran yok!`);
      return;
    }

    const state = useGameStore.getState();
    useGameStore.setState({
      housing: {
        currentHome: housing.id,
        barRecoveryMultiplier: housing.recovery,
        monthlyRent: housing.rent,
      },
      finance: {
        ...state.finance,
        balance: state.finance.balance - moveCost,
        monthlyExpenses: {
          ...state.finance.monthlyExpenses,
          rent: housing.rent,
        },
      },
    });

    useGameStore.getState().addEvent(`Yeni eve taşınıldı: ${HOUSING_LABELS[housing.id]?.name || housing.id}`);
    setMessage(`${HOUSING_LABELS[housing.id]?.name || housing.id} evine taşındın!`);
  };

  return (
    <div className="scene scene--realtor">
      <div className="realtor-header">
        <button className="location-back" onClick={() => setScene('outdoor')}>
          ← Geri
        </button>
        <h2>🏠 Emlakçı</h2>
      </div>

      <p className="realtor-info">
        Daha iyi bir ev = daha hızlı bar toparlanması. Taşınma maliyeti: 2 aylık kira.
      </p>

      <div className="realtor-list">
        {HOUSING_LIST.map((h) => {
          const label = HOUSING_LABELS[h.id] || { icon: '🏠', name: h.id };
          const isCurrent = h.id === currentHome;
          const moveCost = h.rent * 2;
          const canAfford = balance >= moveCost;

          return (
            <div
              key={h.id}
              className={`realtor-card ${isCurrent ? 'realtor-card--current' : ''}`}
            >
              <div className="realtor-card__header">
                <span className="realtor-card__icon">{label.icon}</span>
                <span className="realtor-card__name">{label.name}</span>
                {isCurrent && <span className="realtor-card__badge">Mevcut</span>}
              </div>

              <div className="realtor-card__stats">
                <div>💰 Kira: ₺{h.rent}/ay</div>
                <div>⚡ Recovery: x{h.recovery}</div>
                <div>🏷️ Taşınma: ₺{moveCost}</div>
              </div>

              {!isCurrent && (
                <button
                  className="realtor-card__btn"
                  onClick={() => handleMove(h)}
                  disabled={!canAfford}
                >
                  {canAfford ? 'Taşın' : 'Yetersiz bakiye'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {message && (
        <div className="realtor-message">{message}</div>
      )}
    </div>
  );
}
