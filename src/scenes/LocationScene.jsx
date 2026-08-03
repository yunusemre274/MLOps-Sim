/**
 * LocationScene.jsx — Genel mekan sahnesi bileşeni
 *
 * Tüm mekanlar (park, pub, sinema, galeri) bu bileşeni kullanır.
 * Mekan bilgisi prop olarak gelir, "Ziyaret Et" butonu ile efektler uygulanır.
 * Ziyaret sonrasında NPC karşılaşma olasılığı hesaplanır.
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import { visitLocation } from '../engine/LocationEngine';
import { rollEncounter } from '../engine/EventEngine';
import EventPopup from '../components/EventPopup';
import './LocationScene.css';

export default function LocationScene({
  locationId,
  icon,
  title,
  description,
  effects,
  cost,
  duration,
}) {
  const setScene = useGameStore((s) => s.setScene);
  const balance = useGameStore((s) => s.finance.balance);
  const [message, setMessage] = useState(null);
  const [visited, setVisited] = useState(false);
  const [encounterNPC, setEncounterNPC] = useState(null);

  const canAfford = !cost || balance >= cost;

  const handleVisit = () => {
    const result = visitLocation(locationId);
    setMessage(result.message);
    if (result.success) {
      setVisited(true);

      // NPC karşılaşma kontrolü
      const state = useGameStore.getState();
      const npc = rollEncounter(locationId, state.relationships, state.dayCount);
      if (npc) {
        setEncounterNPC(npc);
      }

      if (result.dayEnded) {
        setTimeout(() => setScene('home'), 1500);
      }
    }
  };

  return (
    <div className="scene scene--location">
      <div className="location-header">
        <button className="location-back" onClick={() => setScene('outdoor')}>
          ← Geri
        </button>
        <h2>{icon} {title}</h2>
      </div>

      <div className="location-body">
        <p className="location-desc">{description}</p>

        <div className="location-effects">
          {effects.map((eff, i) => (
            <div key={i} className={`location-effect ${eff.positive ? 'location-effect--positive' : 'location-effect--negative'}`}>
              <span>{eff.icon}</span>
              <span>{eff.label}</span>
            </div>
          ))}
        </div>

        <div className="location-meta">
          {cost > 0 && (
            <span className={`location-cost ${!canAfford ? 'location-cost--insufficient' : ''}`}>
              💰 ₺{cost}
            </span>
          )}
          {cost === 0 && <span className="location-cost location-cost--free">Ücretsiz</span>}
          {duration && <span className="location-duration">⏱️ {duration} dk</span>}
        </div>

        {message && (
          <div className={`location-message ${visited ? 'location-message--success' : 'location-message--error'}`}>
            {message}
          </div>
        )}

        {!visited ? (
          <button
            className="location-visit-btn"
            onClick={handleVisit}
            disabled={!canAfford}
          >
            {canAfford ? '✨ Ziyaret Et' : '💸 Yeterli paran yok'}
          </button>
        ) : (
          <button className="location-visit-btn location-visit-btn--done" onClick={() => setScene('outdoor')}>
            ← Dışarıya Dön
          </button>
        )}
      </div>

      {/* NPC Karşılaşma Pop-up */}
      {encounterNPC && (
        <EventPopup
          npc={encounterNPC}
          onClose={() => setEncounterNPC(null)}
        />
      )}
    </div>
  );
}
