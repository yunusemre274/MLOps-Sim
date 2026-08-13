/**
 * PhoneJobApp.jsx — Telefonda Kariyer / DevJobs Mobil Uygulaması
 *
 * LinkedIn benzeri modern mobil arayüz.
 * Single Source of Truth: useGameStore (activeMissions, completedMissions, acceptMission)
 * VFS Entegrasyonu: acceptMission tetiklendiğinde globalVFS.syncMission() çağrılır.
 */

import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import companies from '../../data/companies.json';
import missions from '../../data/missions.json';
import './PhoneJobApp.css';

const RANK_ORDER = ['junior', 'junior_plus', 'mid', 'mid_senior', 'senior', 'lead'];
const RANK_LABELS = {
  junior: 'Junior',
  junior_plus: 'Junior+',
  mid: 'Mid-Level',
  mid_senior: 'Mid-Senior',
  senior: 'Senior',
  lead: 'Lead',
};

export default function PhoneJobApp() {
  const rank = useGameStore((s) => s.character.rank);
  const careerPoints = useGameStore((s) => s.character.careerPoints);
  const activeMissions = useGameStore((s) => s.career.activeMissions);
  const completedMissions = useGameStore((s) => s.career.completedMissions);
  const readyToDeliverMissions = useGameStore((s) => s.career.readyToDeliverMissions) || [];
  const acceptMission = useGameStore((s) => s.acceptMission);
  const completeMission = useGameStore((s) => s.completeMission);

  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'talents'
  const [toastMessage, setToastMessage] = useState(null);
  const [filterCompany, setFilterCompany] = useState('all');

  const playerRankIdx = RANK_ORDER.indexOf(rank);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApply = (mission) => {
    if (completedMissions.includes(mission.id)) {
      showToast('⚠️ Bu görevi zaten tamamladınız!');
      return;
    }
    if (activeMissions.includes(mission.id)) {
      showToast('ℹ️ Bu görev zaten aktif listenizde!');
      return;
    }

    acceptMission(mission.id);
    showToast(`📌 "${mission.title}" kabul edildi! Klonlama linki ilanın altında gösteriliyor.`);
  };

  const handleDeliver = (mission) => {
    completeMission(
      mission.id,
      mission.reward.money,
      mission.reward.careerPoints,
      mission.reward.monthlyMaintenance
    );
    showToast(`🎉 "${mission.title}" başarıyla teslim edildi! ₺${mission.reward.money} ve +${mission.reward.careerPoints} KP hesabınıza aktarıldı.`);
  };

  const handleTalentsTabClick = () => {
    showToast('🔒 Yetenek Avı (İşe Alım): Şirket kurduğunuzda (Stage 4-5) açılacaktır!');
  };

  // Görevleri şirket bilgisi ile zenginleştirme
  const enrichedMissions = missions.map((mission) => {
    const company = companies.find((c) => c.availableMissions.includes(mission.id));
    return {
      ...mission,
      company: company || { name: 'İsimsiz Şirket', logo: '🏢', industry: 'Teknoloji', requiredRank: 'junior' },
    };
  });

  // Şirket filtresi
  const filteredMissions = filterCompany === 'all'
    ? enrichedMissions
    : enrichedMissions.filter((m) => m.company.id === filterCompany);

  return (
    <div className="phone-job-app">
      {/* Üst Karşılama ve Tab Başlığı */}
      <div className="pja-header">
        <div className="pja-header__brand">
          <span className="pja-header__icon">💼</span>
          <div>
            <h3>DevJobs Mobile</h3>
            <span className="pja-header__subtitle">MLOps Kariyer Platformu</span>
          </div>
        </div>
        <div className="pja-rank-pill">
          <span>{RANK_LABELS[rank] || 'Junior'}</span>
          <small>{careerPoints} KP</small>
        </div>
      </div>

      {/* Ana Sekmeler: İş İlanları vs Yetenek Avı (Locked) */}
      <div className="pja-subtabs">
        <button
          className={`pja-subtab ${activeTab === 'jobs' ? 'pja-subtab--active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          📋 İş İlanları
        </button>
        <button
          className="pja-subtab pja-subtab--disabled"
          onClick={handleTalentsTabClick}
        >
          🎯 Yetenek Avı <span className="pja-lock-badge">🔒</span>
        </button>
      </div>

      {/* Toast Bildirimi */}
      {toastMessage && (
        <div className="pja-toast animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Şirket Filtre Şeridi */}
      <div className="pja-company-filters">
        <button
          className={`pja-filter-chip ${filterCompany === 'all' ? 'pja-filter-chip--active' : ''}`}
          onClick={() => setFilterCompany('all')}
        >
          Tüm İlanlar
        </button>
        {companies.map((comp) => {
          const locked = RANK_ORDER.indexOf(comp.requiredRank) > playerRankIdx;
          return (
            <button
              key={comp.id}
              className={`pja-filter-chip ${filterCompany === comp.id ? 'pja-filter-chip--active' : ''} ${locked ? 'pja-filter-chip--locked' : ''}`}
              onClick={() => !locked && setFilterCompany(comp.id)}
              disabled={locked}
            >
              <span>{comp.logo}</span> {comp.name} {locked && '🔒'}
            </button>
          );
        })}
      </div>

      {/* Mobil Görev Kartları Listesi */}
      <div className="pja-mission-list">
        {filteredMissions.map((mission) => {
          const isCompleted = completedMissions.includes(mission.id);
          const isActive = activeMissions.includes(mission.id);
          const isCompanyLocked = RANK_ORDER.indexOf(mission.company.requiredRank) > playerRankIdx;

          return (
            <div
              key={mission.id}
              className={`pja-card ${isCompleted ? 'pja-card--completed' : ''} ${isActive ? 'pja-card--active' : ''} ${isCompanyLocked ? 'pja-card--locked' : ''}`}
            >
              {/* Şirket & Aşama Üst Alanı */}
              <div className="pja-card__top">
                <div className="pja-card__company">
                  <span className="pja-card__company-logo">{mission.company.logo}</span>
                  <div>
                    <h5 className="pja-card__company-name">{mission.company.name}</h5>
                    <span className="pja-card__company-industry">{mission.company.industry}</span>
                  </div>
                </div>
                <span className="pja-stage-tag">Stage {mission.stage}</span>
              </div>

              {/* İlan Başlığı ve Açıklaması */}
              <h4 className="pja-card__title">{mission.title}</h4>
              <p className="pja-card__desc">{mission.description}</p>

              {/* Detay Metrikleri */}
              <div className="pja-card__metrics">
                <span className="pja-metric">
                  <small>Zorluk:</small> {'⭐'.repeat(mission.difficulty)}
                </span>
                <span className="pja-metric pja-metric--reward">
                  <small>Maaş:</small> ₺{mission.reward.money.toLocaleString()}
                </span>
                <span className="pja-metric pja-metric--kp">
                  <small>Kariyer:</small> +{mission.reward.careerPoints} KP
                </span>
              </div>

              {/* Aksiyon ve Durum Butonu */}
              <div className="pja-card__footer">
                {isCompleted ? (
                  <div className="pja-status-badge pja-status-badge--completed">
                    ✅ Tamamlandı
                  </div>
                ) : isActive ? (
                  <div className="pja-active-container">
                    <div className="pja-git-box">
                      <div className="pja-git-box__header">
                        <span>💻 Git Linki</span>
                        <button
                          className="pja-git-box__copy"
                          onClick={() => {
                            const gitCmd = `git clone git@devjobs.local:${mission.company.id || 'company'}/${mission.id}.git`;
                            navigator.clipboard?.writeText(gitCmd);
                            showToast('📋 Git komutu panoya kopyalandı!');
                          }}
                        >
                          📋 Kopyala
                        </button>
                      </div>
                      <code className="pja-git-code">
                        git clone git@devjobs.local:{mission.company.id || 'company'}/{mission.id}.git
                      </code>
                    </div>

                    {readyToDeliverMissions.includes(mission.id) ? (
                      <button
                        className="pja-deliver-btn"
                        onClick={() => handleDeliver(mission)}
                      >
                        ✅ Görevi Teslim Et (+₺{mission.reward.money})
                      </button>
                    ) : (
                      <div className="pja-status-badge pja-status-badge--active">
                        🔄 Çalışılıyor (git push Bekleniyor)
                      </div>
                    )}
                  </div>
                ) : isCompanyLocked ? (
                  <div className="pja-status-badge pja-status-badge--locked">
                    🔒 {RANK_LABELS[mission.company.requiredRank]} Rütbesi Gerekli
                  </div>
                ) : (
                  <button
                    className="pja-apply-btn"
                    onClick={() => handleApply(mission)}
                  >
                    🚀 İşe Başvur
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
