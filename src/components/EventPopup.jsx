/**
 * EventPopup.jsx — NPC karşılaşma pop-up'ı
 *
 * Bir NPC ile karşılaşıldığında gösterilir.
 * NPC avatar, isim, diyalog metni ve etkileşim seçenekleri sunar.
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import { applyInteraction } from '../engine/BarEngine';
import { advanceTime } from '../engine/TimeEngine';
import { getDialogue, getEncounterOptions, checkStatusTransition } from '../engine/EventEngine';
import './EventPopup.css';

export default function EventPopup({ npc, onClose }) {
  const relationships = useGameStore((s) => s.relationships);
  const currentTime = useGameStore((s) => s.currentTime);
  const dayCount = useGameStore((s) => s.dayCount);

  const rel = relationships[npc.id] || { level: 0, status: 'stranger', lastInteraction: null };
  const dialogue = getDialogue(npc, rel.level);
  const options = getEncounterOptions(npc, rel.level);

  const [chosen, setChosen] = useState(null);
  const [transitionMsg, setTransitionMsg] = useState(null);

  const handleOption = (option) => {
    setChosen(option.id);
    const state = useGameStore.getState();

    // İlişki güncelle
    const oldLevel = rel.level;
    const newLevel = Math.max(0, Math.min(100, oldLevel + (option.effect.relationship || 0)));

    useGameStore.getState().updateRelationship(npc.id, option.effect.relationship || 0);

    // İlişki durumu güncellemesini kaydet (lastInteraction)
    useGameStore.setState((s) => ({
      relationships: {
        ...s.relationships,
        [npc.id]: {
          ...s.relationships[npc.id],
          lastInteraction: dayCount,
        },
      },
    }));

    // Bar efektleri
    const barEffects = {};
    if (option.effect.stress !== undefined) barEffects.stress = option.effect.stress;
    if (option.effect.hunger !== undefined) barEffects.hunger = option.effect.hunger;

    if (Object.keys(barEffects).length > 0) {
      const newBars = applyInteraction(state.bars, barEffects);
      useGameStore.setState({ bars: newBars });
    }

    // Zaman tüketimi
    if (option.time) {
      const { newTime } = advanceTime(currentTime, option.time);
      useGameStore.setState({ currentTime: newTime });
    }

    // İlişki geçişi kontrolü
    const transition = checkStatusTransition(oldLevel, newLevel);
    if (transition.transitioned) {
      const statusLabels = {
        stranger: 'Yabancı',
        acquaintance: 'Tanıdık',
        friend: 'Arkadaş',
        closeFriend: 'Yakın Arkadaş',
        bestFriend: 'En İyi Arkadaş',
      };
      setTransitionMsg(`🎉 ${npc.name} ile ilişkiniz: ${statusLabels[transition.newStatus]}`);
      useGameStore.getState().addEvent(`${npc.name} ile ilişki: ${statusLabels[transition.newStatus]}`);
    }

    useGameStore.getState().addEvent(`${npc.name} ile karşılaşıldı`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal event-popup" onClick={(e) => e.stopPropagation()}>
        <div className="event-popup__header">
          <span className="event-popup__avatar">{npc.avatar}</span>
          <div className="event-popup__info">
            <h3>{npc.name}</h3>
            <span className="event-popup__profession">{npc.profession}</span>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="event-popup__body">
          <div className="event-popup__dialogue">
            "{dialogue}"
          </div>

          {transitionMsg && (
            <div className="event-popup__transition">{transitionMsg}</div>
          )}

          <div className="event-popup__options">
            {options.map((opt) => (
              <button
                key={opt.id}
                className={`event-popup__option ${chosen === opt.id ? 'event-popup__option--chosen' : ''}`}
                onClick={() => handleOption(opt)}
                disabled={!!chosen}
              >
                {opt.label}
                {opt.time && <span className="event-popup__time">⏱️ {opt.time}dk</span>}
              </button>
            ))}
          </div>

          {chosen && (
            <button className="event-popup__done" onClick={onClose}>
              Tamam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
