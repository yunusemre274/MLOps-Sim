/**
 * PlazaScene.jsx — Plaza / Ofis sahnesi
 *
 * Ofis seçenekleri, şirket kurma akışı, çalışan yönetimi, finans paneli.
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import {
  canFoundCompany, foundCompany, getOffices, getCandidates,
  calculateMonthlyFinance, getRankUnlocks,
} from '../engine/CompanyEngine';
import './PlazaScene.css';

export default function PlazaScene() {
  const setScene = useGameStore((s) => s.setScene);
  const state = useGameStore();
  const [view, setView] = useState('main'); // main, found, hire, finance, delegate
  const [companyName, setCompanyName] = useState('');
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [notification, setNotification] = useState(null);

  const company = state.career.ownCompany;
  const offices = getOffices();
  const candidates = getCandidates();
  const foundCheck = canFoundCompany(state);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Şirket kurma işlemi
  const handleFound = () => {
    if (!companyName.trim()) { notify('Şirket adı giriniz!'); return; }
    if (!selectedOffice) { notify('Ofis seçiniz!'); return; }
    const office = offices.find((o) => o.id === selectedOffice);
    if (state.finance.balance < office.monthlyRent * 3) {
      notify(`Yetersiz bakiye! En az ₺${office.monthlyRent * 3} gerekli (3 aylık depozito).`);
      return;
    }

    const newCompany = foundCompany(companyName.trim(), selectedOffice);
    newCompany.foundedDay = state.dayCount;

    useGameStore.setState((s) => ({
      career: { ...s.career, ownCompany: newCompany },
      finance: {
        ...s.finance,
        balance: s.finance.balance - (office.monthlyRent * 3),
        monthlyExpenses: {
          ...s.finance.monthlyExpenses,
          serverCosts: office.monthlyRent,
        },
      },
    }));
    useGameStore.getState().addEvent(`🏢 ${companyName} şirketi kuruldu!`);
    setView('main');
    notify(`🎉 ${companyName} şirketi kuruldu!`);
  };

  // Çalışan işe alma
  const handleHire = (candidate) => {
    if (!company) return;
    if (company.employees.length >= company.capacity) {
      notify('Ofis kapasitesi dolu! Daha büyük bir ofise taşın.');
      return;
    }
    if (company.employees.some((e) => e.id === candidate.id)) {
      notify(`${candidate.name} zaten çalışıyor!`);
      return;
    }

    useGameStore.setState((s) => ({
      career: {
        ...s.career,
        ownCompany: {
          ...s.career.ownCompany,
          employees: [...s.career.ownCompany.employees, candidate],
        },
      },
    }));
    useGameStore.getState().addEvent(`👤 ${candidate.name} işe alındı!`);
    notify(`✅ ${candidate.name} ekibine katıldı!`);
  };

  // Finans raporu
  const financeReport = company ? calculateMonthlyFinance(state) : null;

  return (
    <div className="scene scene--plaza">
      <div className="plaza-header">
        <button className="plaza-back" onClick={() => setScene('outdoor')}>
          ← Dışarı Çık
        </button>
        <h2>🏢 İş Plazası</h2>
      </div>

      {notification && <div className="plaza-notification">{notification}</div>}

      <div className="plaza-body">
        {/* Ana menü */}
        {!company ? (
          <div className="plaza-nocorp">
            <h3>🚀 Kendi Şirketini Kur</h3>
            <p>Senior rütbesine ulaş, 10 görevi tamamla ve 5.000₺ biriktir!</p>

            <div className="plaza-checks">
              {foundCheck.checks.map((c, i) => (
                <div key={i} className={`plaza-check ${c.passed ? 'plaza-check--pass' : 'plaza-check--fail'}`}>
                  <span>{c.passed ? '✅' : '❌'}</span>
                  <span>{c.name}</span>
                  <span className="plaza-check__val">{String(c.current)} / {String(c.required)}</span>
                </div>
              ))}
            </div>

            {foundCheck.canFound && (
              <button className="plaza-found-btn" onClick={() => setView('found')}>
                🏢 Şirket Kur
              </button>
            )}

            {/* Şirket kurma formu */}
            {view === 'found' && (
              <div className="plaza-found-form">
                <input
                  type="text"
                  placeholder="Şirket adı..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="plaza-input"
                />
                <h4>Ofis Seçimi</h4>
                <div className="plaza-offices">
                  {offices.map((o) => (
                    <button
                      key={o.id}
                      className={`plaza-office ${selectedOffice === o.id ? 'plaza-office--selected' : ''}`}
                      onClick={() => setSelectedOffice(o.id)}
                    >
                      <span className="plaza-office__emoji">{o.emoji}</span>
                      <span className="plaza-office__name">{o.name}</span>
                      <span className="plaza-office__rent">₺{o.monthlyRent}/ay</span>
                      <span className="plaza-office__cap">Kapasite: {o.capacity}</span>
                    </button>
                  ))}
                </div>
                <button className="plaza-confirm-btn" onClick={handleFound}>✅ Şirketi Kur</button>
              </div>
            )}
          </div>
        ) : (
          /* Şirket yönetim paneli */
          <div className="plaza-corp">
            <div className="plaza-corp-header">
              <h3>{company.name}</h3>
              <span>{company.officeName} • {company.employees.length}/{company.capacity} çalışan</span>
            </div>

            <div className="plaza-corp-nav">
              <button onClick={() => setView('main')} className={view === 'main' ? 'active' : ''}>📋 Genel</button>
              <button onClick={() => setView('hire')} className={view === 'hire' ? 'active' : ''}>👤 İşe Al</button>
              <button onClick={() => setView('finance')} className={view === 'finance' ? 'active' : ''}>💰 Finans</button>
            </div>

            {view === 'main' && (
              <div className="plaza-corp-main">
                <div className="plaza-stat-grid">
                  <div className="plaza-stat">
                    <span>👥 Çalışanlar</span>
                    <span>{company.employees.length}/{company.capacity}</span>
                  </div>
                  <div className="plaza-stat">
                    <span>🏢 Ofis</span>
                    <span>{company.officeName}</span>
                  </div>
                  <div className="plaza-stat">
                    <span>⭐ İtibar</span>
                    <span>{company.reputation}/100</span>
                  </div>
                  <div className="plaza-stat">
                    <span>📋 Müşteriler</span>
                    <span>{company.clients.length}</span>
                  </div>
                </div>
                {company.employees.length > 0 && (
                  <div className="plaza-employees">
                    <h4>Ekip</h4>
                    {company.employees.map((e) => (
                      <div key={e.id} className="plaza-emp-card">
                        <span className="plaza-emp-name">{e.name}</span>
                        <span className="plaza-emp-spec">{e.specialty}</span>
                        <span className="plaza-emp-skill">Skill: {e.skill}</span>
                        <span className="plaza-emp-salary">₺{e.salary}/ay</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'hire' && (
              <div className="plaza-hire">
                <h4>Aday Havuzu</h4>
                {candidates.map((c) => {
                  const hired = company.employees.some((e) => e.id === c.id);
                  return (
                    <div key={c.id} className={`plaza-candidate ${hired ? 'plaza-candidate--hired' : ''}`}>
                      <div>
                        <span className="plaza-cand-name">{c.name}</span>
                        <span className="plaza-cand-spec">{c.specialty}</span>
                      </div>
                      <div className="plaza-cand-stats">
                        <span>Skill: {c.skill}</span>
                        <span>₺{c.salary}/ay</span>
                      </div>
                      {!hired ? (
                        <button onClick={() => handleHire(c)}>İşe Al</button>
                      ) : (
                        <span className="plaza-hired-badge">✅ Ekipte</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {view === 'finance' && financeReport && (
              <div className="plaza-finance">
                <h4>💰 Aylık Finans Raporu</h4>
                <div className="plaza-finance-grid">
                  <div className="plaza-finance-section plaza-finance--income">
                    <h5>Gelir</h5>
                    <div><span>Müşteri geliri:</span><span>+₺{financeReport.income.clientIncome}</span></div>
                    <div><span>Bakım geliri:</span><span>+₺{financeReport.income.passiveIncome}</span></div>
                    <div className="plaza-finance-total"><span>Toplam:</span><span>+₺{financeReport.income.total}</span></div>
                  </div>
                  <div className="plaza-finance-section plaza-finance--expense">
                    <h5>Gider</h5>
                    <div><span>Çalışan maaşları:</span><span>-₺{financeReport.expenses.employeeSalaries}</span></div>
                    <div><span>Ofis kirası:</span><span>-₺{financeReport.expenses.officeRent}</span></div>
                    <div><span>Ev kirası:</span><span>-₺{financeReport.expenses.personalRent}</span></div>
                    <div className="plaza-finance-total"><span>Toplam:</span><span>-₺{financeReport.expenses.total}</span></div>
                  </div>
                </div>
                <div className={`plaza-net ${financeReport.netProfit >= 0 ? 'plaza-net--positive' : 'plaza-net--negative'}`}>
                  Net Kâr: {financeReport.netProfit >= 0 ? '+' : ''}₺{financeReport.netProfit}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
