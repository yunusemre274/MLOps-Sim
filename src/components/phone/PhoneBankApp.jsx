/**
 * PhoneBankApp.jsx — DevBank Mobil Bankacılık Uygulaması
 *
 * Canlı bakiye gösterimi, gelir/gider işlem geçmişi ve finansal özet.
 */

import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import './PhoneBankApp.css';

export default function PhoneBankApp() {
  const balance = useGameStore((s) => s.finance.balance);
  const monthlyPassiveIncome = useGameStore((s) => s.finance.monthlyPassiveIncome);
  const monthlyExpenses = useGameStore((s) => s.finance.monthlyExpenses);
  const transactions = useGameStore((s) => s.finance.transactions) || [];
  const characterName = useGameStore((s) => s.character.name) || 'Oyuncu';

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'income' | 'expense'

  const filteredTxs = activeFilter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === activeFilter);

  const totalExpenseEst = Object.values(monthlyExpenses || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="phone-bank-app">
      {/* Üst Bar */}
      <div className="pba-header">
        <div className="pba-brand">
          <span className="pba-logo">🏦</span>
          <h3>DevBank Mobile</h3>
        </div>
        <span className="pba-secure-badge">🔒 Güvenli</span>
      </div>

      {/* Kart ve Bakiye Alanı */}
      <div className="pba-body">
        <div className="pba-card-widget">
          <div className="pba-card-top">
            <span className="pba-card-chip">💳 Platinum DevCard</span>
            <span className="pba-card-contactless">📶</span>
          </div>
          <div className="pba-card-balance-section">
            <span className="pba-card-label">Kullanılabilir Bakiye</span>
            <div className="pba-card-balance">₺{Math.floor(balance).toLocaleString('tr-TR')}</div>
          </div>
          <div className="pba-card-bottom">
            <span>{characterName.toUpperCase()}</span>
            <span>TR42 0006 1000 0000 1234 56</span>
          </div>
        </div>

        {/* Finansal Özet Kutuları */}
        <div className="pba-summary-row">
          <div className="pba-summary-box pba-summary-box--income">
            <span>Aylık Pasif Gelir</span>
            <strong>+₺{monthlyPassiveIncome}</strong>
          </div>
          <div className="pba-summary-box pba-summary-box--expense">
            <span>Aylık Sabit Gider</span>
            <strong>-₺{totalExpenseEst}</strong>
          </div>
        </div>

        {/* Hesap Hareketleri */}
        <div className="pba-transactions-header">
          <h4>Hesap Hareketleri</h4>
          <div className="pba-tx-filters">
            <button
              className={`pba-tx-filter ${activeFilter === 'all' ? 'pba-tx-filter--active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Tümü
            </button>
            <button
              className={`pba-tx-filter ${activeFilter === 'income' ? 'pba-tx-filter--active' : ''}`}
              onClick={() => setActiveFilter('income')}
            >
              Gelirler
            </button>
            <button
              className={`pba-tx-filter ${activeFilter === 'expense' ? 'pba-tx-filter--active' : ''}`}
              onClick={() => setActiveFilter('expense')}
            >
              Giderler
            </button>
          </div>
        </div>

        <div className="pba-tx-list">
          {filteredTxs.length > 0 ? (
            filteredTxs.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div key={tx.id} className="pba-tx-item">
                  <span className={`pba-tx-icon ${isIncome ? 'pba-tx-icon--income' : 'pba-tx-icon--expense'}`}>
                    {isIncome ? '📈' : '📉'}
                  </span>
                  <div className="pba-tx-details">
                    <strong>{tx.title}</strong>
                    <small>Gün {tx.day || 1} • {tx.time || '08:00'}</small>
                  </div>
                  <div className={`pba-tx-amount ${isIncome ? 'pba-tx-amount--income' : 'pba-tx-amount--expense'}`}>
                    {isIncome ? '+' : '-'}₺{tx.amount}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="pba-empty-tx">Kayıtlı işlem bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  );
}
