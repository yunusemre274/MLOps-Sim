/**
 * PhoneScene.jsx — Telefon sahnesi
 *
 * NPC kontakt listesi ve profil görüntüleme.
 * Sadece daha önce tanışılmış NPC'ler görünür.
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import npcs from '../data/npcs.json';
import { getRelationshipStatus } from '../engine/EventEngine';
import MarketScene from './MarketScene';
import PhoneJobApp from '../components/phone/PhoneJobApp';
import './PhoneScene.css';

const STATUS_LABELS = {
  stranger: 'Yabancı',
  acquaintance: 'Tanıdık',
  friend: 'Arkadaş',
  closeFriend: 'Yakın Arkadaş',
  bestFriend: 'En İyi Arkadaş',
};

export default function PhoneScene() {
  const setScene = useGameStore((s) => s.setScene);
  const relationships = useGameStore((s) => s.relationships);
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'jobs' | 'market'
  const [selectedNPC, setSelectedNPC] = useState(null);

  // Sadece tanışılmış NPC'ler
  const knownNPCs = npcs.filter(
    (npc) => relationships[npc.id] && relationships[npc.id].level > 0
  );

  if (activeTab === 'market') {
    return <MarketScene isOnline />;
  }

  return (
    <div className="scene scene--phone">
      <div className="phone-header">
        <button className="location-back" onClick={() => setScene('home')}>
          ← Eve Dön
        </button>
        <h2>📱 Telefon</h2>
      </div>

      <div className="phone-tabs">
        <button
          className={`phone-tab ${activeTab === 'contacts' ? 'phone-tab--active' : ''}`}
          onClick={() => { setActiveTab('contacts'); setSelectedNPC(null); }}
        >
          👥 Rehber
        </button>
        <button
          className={`phone-tab ${activeTab === 'jobs' ? 'phone-tab--active' : ''}`}
          onClick={() => { setActiveTab('jobs'); setSelectedNPC(null); }}
        >
          💼 Kariyer
        </button>
        <button
          className={`phone-tab ${activeTab === 'market' ? 'phone-tab--active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          📦 Market
        </button>
      </div>

      {activeTab === 'jobs' ? (
        <PhoneJobApp />
      ) : selectedNPC ? (
        // NPC Profil detayı
        <div className="phone-profile">
          <button className="phone-profile__back" onClick={() => setSelectedNPC(null)}>
            ← Rehber
          </button>
          <div className="phone-profile__header">
            <span className="phone-profile__avatar">{selectedNPC.avatar}</span>
            <h3>{selectedNPC.name}</h3>
            <span className="phone-profile__profession">{selectedNPC.profession}</span>
          </div>
          <div className="phone-profile__stats">
            <div className="phone-profile__stat">
              <span>Kişilik</span>
              <span>{selectedNPC.personality}</span>
            </div>
            <div className="phone-profile__stat">
              <span>İlişki Seviyesi</span>
              <span>{relationships[selectedNPC.id]?.level || 0}/100</span>
            </div>
            <div className="phone-profile__stat">
              <span>Durum</span>
              <span>{STATUS_LABELS[getRelationshipStatus(relationships[selectedNPC.id]?.level || 0)]}</span>
            </div>
            <div className="phone-profile__stat">
              <span>Buluşma Yerleri</span>
              <span>{selectedNPC.locations.join(', ')}</span>
            </div>
          </div>
        </div>
      ) : (
        // Rehber listesi
        <div className="phone-contacts">
          {knownNPCs.length === 0 ? (
            <div className="phone-empty">
              <span>📭</span>
              <p>Henüz kimseyle tanışmadın.</p>
              <p className="phone-hint">Dışarı çık ve mekanları ziyaret et!</p>
            </div>
          ) : (
            knownNPCs.map((npc) => {
              const rel = relationships[npc.id];
              const status = getRelationshipStatus(rel.level);
              return (
                <button
                  key={npc.id}
                  className="phone-contact"
                  onClick={() => setSelectedNPC(npc)}
                >
                  <span className="phone-contact__avatar">{npc.avatar}</span>
                  <div className="phone-contact__info">
                    <span className="phone-contact__name">{npc.name}</span>
                    <span className="phone-contact__status">{STATUS_LABELS[status]}</span>
                  </div>
                  <span className="phone-contact__level">{rel.level}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
