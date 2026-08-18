/**
 * PhoneCallApp.jsx — Telefon Arama Simülasyonu
 *
 * Rehberden NPC seçip arama yapma, "Aranıyor..." animasyonu, konuşma ve ilişki artışı.
 */

import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import npcs from '../../data/npcs.json';
import './PhoneCallApp.css';

const CALL_DIALOGS = {
  ayse: [
    'Alo! Selam, nasılsın? Tam ben de React ile model sonuçlarını görselleştiriyordum.',
    'Hey! Aradığın çok iyi oldu, hafta sonu MLOps meetup etkinliği var, birlikte gidelim mi?',
  ],
  mehmet: [
    'Selam dostum! Kubernetes cluster bakımındaydım. Yeni container projen nasıl gidiyor?',
    'Alo! Akşam bir kahve içeriz demiştik, unutmadın değil mi?',
  ],
  zeynep: [
    'Merhabalar! Yeni UI kit hazırlıyordum. Dashboard için renk seçimlerini konuşalım mı?',
    'Alo! Tasarım ekibinden selamlar. Senin projeye harika bir logo tasarladım!',
  ],
  burak: [
    'Alo, selam. Veri pipeline testleri çalışıyordu. Model metriklerinde harika artış yakaladık!',
    'Merhaba! Feature engineering konusundaki ipucun çok işe yaradı, teşekkürler.',
  ],
};

export default function PhoneCallApp() {
  const relationships = useGameStore((s) => s.relationships);
  const updateRelationship = useGameStore((s) => s.updateRelationship);

  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'keypad'
  const [dialedNumber, setDialedNumber] = useState('');
  const [callState, setCallState] = useState(null); // null | { npc, status: 'calling'|'connected', dialog: string }

  const handleStartCall = (npc) => {
    setCallState({
      npc,
      status: 'calling',
      dialog: 'Aranıyor...',
    });

    setTimeout(() => {
      const dialogs = CALL_DIALOGS[npc.id] || [npc.greeting || 'Alo, merhaba!'];
      const chosenDialog = dialogs[Math.floor(Math.random() * dialogs.length)];

      setCallState({
        npc,
        status: 'connected',
        dialog: chosenDialog,
      });

      updateRelationship(npc.id, 2);
    }, 1800);
  };

  const handleEndCall = () => {
    setCallState(null);
  };

  const handleKeypadPress = (num) => {
    if (dialedNumber.length < 11) {
      setDialedNumber((prev) => prev + num);
    }
  };

  return (
    <div className="phone-call-app">
      {callState ? (
        /* Arama Ekranı */
        <div className="pca-calling-screen">
          <div className="pca-calling-avatar-wrapper">
            <span className="pca-calling-avatar">{callState.npc.avatar || '👤'}</span>
            <div className={`pca-pulse-ring ${callState.status === 'calling' ? 'pca-pulse-ring--active' : ''}`} />
          </div>

          <h3>{callState.npc.name}</h3>
          <p className="pca-calling-status">
            {callState.status === 'calling' ? 'Aranıyor...' : 'Görüşme Başladı (00:14)'}
          </p>

          {callState.status === 'connected' && (
            <div className="pca-speech-box">
              <p>"{callState.dialog}"</p>
              <span className="pca-rel-tag">+2 İlişki Puanı</span>
            </div>
          )}

          <div className="pca-call-controls">
            <button className="pca-end-call-btn" onClick={handleEndCall}>
              📞 Kapat
            </button>
          </div>
        </div>
      ) : (
        /* Rehber & Tuş Takımı */
        <div className="pca-main">
          <div className="pca-top-tabs">
            <button
              className={`pca-tab ${activeTab === 'contacts' ? 'pca-tab--active' : ''}`}
              onClick={() => setActiveTab('contacts')}
            >
              👥 Kişiler
            </button>
            <button
              className={`pca-tab ${activeTab === 'keypad' ? 'pca-tab--active' : ''}`}
              onClick={() => setActiveTab('keypad')}
            >
              🔢 Tuşlar
            </button>
          </div>

          {activeTab === 'contacts' && (
            <div className="pca-contacts-list">
              {npcs.map((npc) => {
                const rel = relationships[npc.id] || { level: 10 };
                return (
                  <div key={npc.id} className="pca-contact-row">
                    <span className="pca-avatar">{npc.avatar}</span>
                    <div className="pca-contact-meta">
                      <h4>{npc.name}</h4>
                      <p>{npc.profession} • {rel.level}/100</p>
                    </div>
                    <button className="pca-call-btn" onClick={() => handleStartCall(npc)}>
                      📞 Ara
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'keypad' && (
            <div className="pca-keypad-view">
              <div className="pca-dialed-display">
                {dialedNumber || 'Numara Girin'}
              </div>
              <div className="pca-keypad-grid">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                  <button key={k} className="pca-key-btn" onClick={() => handleKeypadPress(k)}>
                    {k}
                  </button>
                ))}
              </div>
              <div className="pca-keypad-actions">
                <button
                  className="pca-call-action-btn"
                  onClick={() => handleStartCall(npcs[0])}
                  disabled={!dialedNumber}
                >
                  📞
                </button>
                {dialedNumber && (
                  <button
                    className="pca-delete-btn"
                    onClick={() => setDialedNumber((prev) => prev.slice(0, -1))}
                  >
                    ⌫
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
