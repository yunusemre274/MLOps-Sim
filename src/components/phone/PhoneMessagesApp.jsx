/**
 * PhoneMessagesApp.jsx — Mesajlar (SMS / Sistem Bildirimleri)
 *
 * Market teslimatı, banka hareketleri ve iş başvuruları için tek yönlü sistem mesajları.
 */

import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import './PhoneMessagesApp.css';

export default function PhoneMessagesApp() {
  const smsMessages = useGameStore((s) => s.smsMessages) || [];
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredMessages = selectedFilter === 'all'
    ? smsMessages
    : smsMessages.filter((m) => m.category === selectedFilter || m.from.toLowerCase().includes(selectedFilter));

  const getCategoryIcon = (cat, from) => {
    if (cat === 'market' || from.includes('Market') || from.includes('Getir')) return '🛵';
    if (cat === 'bank' || from.includes('Bank')) return '🏦';
    if (cat === 'jobs' || from.includes('DevJobs')) return '💼';
    return '✉️';
  };

  return (
    <div className="phone-messages-app">
      {/* Başlık */}
      <div className="pma-header">
        <div className="pma-brand">
          <span className="pma-icon">✉️</span>
          <h3>Mesajlar (SMS)</h3>
        </div>
        <span className="pma-badge">{smsMessages.length} Bildirim</span>
      </div>

      {/* Kategori Filtresi */}
      <div className="pma-filters">
        <button
          className={`pma-filter-chip ${selectedFilter === 'all' ? 'pma-filter-chip--active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          Tümü
        </button>
        <button
          className={`pma-filter-chip ${selectedFilter === 'market' ? 'pma-filter-chip--active' : ''}`}
          onClick={() => setSelectedFilter('market')}
        >
          🛵 Kurye / Market
        </button>
        <button
          className={`pma-filter-chip ${selectedFilter === 'bank' ? 'pma-filter-chip--active' : ''}`}
          onClick={() => setSelectedFilter('bank')}
        >
          🏦 DevBank
        </button>
        <button
          className={`pma-filter-chip ${selectedFilter === 'jobs' ? 'pma-filter-chip--active' : ''}`}
          onClick={() => setSelectedFilter('jobs')}
        >
          💼 DevJobs
        </button>
      </div>

      {/* Mesaj Listesi */}
      <div className="pma-list">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <div key={msg.id} className="pma-card">
              <div className="pma-card-top">
                <div className="pma-sender">
                  <span className="pma-sender-icon">{getCategoryIcon(msg.category, msg.from)}</span>
                  <strong>{msg.from}</strong>
                </div>
                <span className="pma-time">Gün {msg.day || 1} • {msg.time || '08:00'}</span>
              </div>
              <p className="pma-text">{msg.text}</p>
            </div>
          ))
        ) : (
          <div className="pma-empty">
            <span className="pma-empty-icon">📭</span>
            <p>Bu kategoride henüz sistem mesajı yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}
