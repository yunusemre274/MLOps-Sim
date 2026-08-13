/**
 * JobPlatformScene.jsx — İş bulma platformu (LinkedIn benzeri)
 *
 * Şirket listesi, görev detayları, başvuru ve görev sonuç ekranı.
 * ComputerScene içindeki bir sekme olarak değil, bağımsız sahne olarak çalışır.
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import companies from '../data/companies.json';
import missions from '../data/missions.json';
import { checkMission, setupMissionRepo } from '../engine/MissionEngine';
import './JobPlatformScene.css';

const RANK_ORDER = ['junior', 'junior_plus', 'mid', 'mid_senior', 'senior', 'lead'];
const RANK_LABELS = {
  junior: 'Junior', junior_plus: 'Junior+', mid: 'Mid-Level',
  mid_senior: 'Mid-Senior', senior: 'Senior', lead: 'Lead',
};

export default function JobPlatformScene() {
  const setScene = useGameStore((s) => s.setScene);
  const rank = useGameStore((s) => s.character.rank);
  const careerPoints = useGameStore((s) => s.character.careerPoints);
  const completedMissions = useGameStore((s) => s.career.completedMissions);
  const activeMissions = useGameStore((s) => s.career.activeMissions);
  const readyToDeliverMissions = useGameStore((s) => s.career.readyToDeliverMissions) || [];
  const acceptMission = useGameStore((s) => s.acceptMission);
  const completeMission = useGameStore((s) => s.completeMission);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [notification, setNotification] = useState(null);

  const playerRankIdx = RANK_ORDER.indexOf(rank);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAccept = (mission) => {
    if (completedMissions.includes(mission.id)) {
      showNotification('Bu görevi zaten tamamladın!');
      return;
    }
    if (activeMissions.includes(mission.id)) {
      showNotification('Bu görev zaten aktif!');
      return;
    }
    acceptMission(mission.id);
    const gitUrl = `git@devjobs.local:${mission.companyId || 'company'}/${mission.id}.git`;
    showNotification(`📌 "${mission.title}" kabul edildi! Aşağıdaki git linki ile terminalden klonlayın.`);
  };

  const handleDeliver = (mission) => {
    completeMission(
      mission.id,
      mission.reward.money,
      mission.reward.careerPoints,
      mission.reward.monthlyMaintenance
    );
    showNotification(`🎉 "${mission.title}" görevi başarıyla teslim edildi! ₺${mission.reward.money} ve +${mission.reward.careerPoints} KP hesabınıza aktarıldı.`);
  };

  return (
    <div className="scene scene--jobplatform">
      <div className="jp-header">
        <button className="jp-back" onClick={() => setScene('computer')}>
          ← Bilgisayara Dön
        </button>
        <h2>💼 DevJobs — İş Platformu</h2>
        <div className="jp-rank-badge">
          <span className="jp-rank-label">{RANK_LABELS[rank]}</span>
          <span className="jp-rank-points">{careerPoints} KP</span>
        </div>
      </div>

      {notification && <div className="jp-notification">{notification}</div>}

      <div className="jp-body">
        {/* Sol panel — Şirket listesi */}
        <div className="jp-sidebar">
          <h3>Şirketler</h3>
          {companies.map((company) => {
            const locked = RANK_ORDER.indexOf(company.requiredRank) > playerRankIdx;
            return (
              <button
                key={company.id}
                className={`jp-company-card ${selectedCompany?.id === company.id ? 'jp-company-card--active' : ''} ${locked ? 'jp-company-card--locked' : ''}`}
                onClick={() => !locked && setSelectedCompany(company)}
                disabled={locked}
              >
                <span className="jp-company-logo">{company.logo}</span>
                <div className="jp-company-info">
                  <span className="jp-company-name">{company.name}</span>
                  <span className="jp-company-industry">{company.industry}</span>
                </div>
                {locked && <span className="jp-lock">🔒</span>}
              </button>
            );
          })}
        </div>

        {/* Sağ panel — Görev listesi veya detay */}
        <div className="jp-main">
          {!selectedCompany ? (
            <div className="jp-empty">
              <span>🏢</span>
              <p>Bir şirket seçerek görevleri görüntüle</p>
            </div>
          ) : !selectedMission ? (
            <>
              <div className="jp-company-header">
                <span className="jp-company-header__logo">{selectedCompany.logo}</span>
                <div>
                  <h3>{selectedCompany.name}</h3>
                  <p>{selectedCompany.description}</p>
                </div>
              </div>
              <div className="jp-missions">
                {selectedCompany.availableMissions.map((mId) => {
                  const mission = missions.find((m) => m.id === mId);
                  if (!mission) return null;
                  const done = completedMissions.includes(mission.id);
                  const active = activeMissions.includes(mission.id);
                  const ready = readyToDeliverMissions.includes(mission.id);

                  return (
                    <div key={mission.id} className={`jp-mission-card ${done ? 'jp-mission-card--done' : ''}`}>
                      <div className="jp-mission-card__header">
                        <h4>{mission.title}</h4>
                        {done && <span className="jp-badge jp-badge--done">✅ Tamamlandı</span>}
                        {ready && <span className="jp-badge jp-badge--ready">✨ Teslime Hazır (Pipeline PASSED)</span>}
                        {active && !done && !ready && <span className="jp-badge jp-badge--active">🔄 Çalışılıyor (git push Bekleniyor)</span>}
                      </div>
                      <p className="jp-mission-card__desc">{mission.description}</p>
                      <div className="jp-mission-card__meta">
                        <span>{'⭐'.repeat(mission.difficulty)}</span>
                        <span>💰 ₺{mission.reward.money}</span>
                        <span>📈 {mission.reward.careerPoints} KP</span>
                        <span>Aşama {mission.stage}</span>
                      </div>

                      {/* Kopyalanabilir Git Linki (Aktif görevlerde gösterilir) */}
                      {active && !done && (
                        <div className="jp-git-box">
                          <div className="jp-git-box__header">
                            <span>💻 Klonlama Linki</span>
                            <button
                              className="jp-git-box__copy"
                              onClick={() => {
                                const gitUrl = `git clone git@devjobs.local:${selectedCompany.id}/${mission.id}.git`;
                                navigator.clipboard?.writeText(gitUrl);
                                showNotification('📋 Git komutu panoya kopyalandı!');
                              }}
                            >
                              📋 Kopyala
                            </button>
                          </div>
                          <code className="jp-git-box__code">
                            git clone git@devjobs.local:{selectedCompany.id}/{mission.id}.git
                          </code>
                        </div>
                      )}

                      <div className="jp-mission-card__actions">
                        <button onClick={() => setSelectedMission(mission)}>Detay</button>
                        {!done && !active && (
                          <button className="jp-btn--primary" onClick={() => handleAccept(mission)}>
                            🚀 Başvur / Kabul Et
                          </button>
                        )}
                        {ready && (
                          <button className="jp-btn--deliver" onClick={() => handleDeliver(mission)}>
                            ✅ Görevi Teslim Et (+₺{mission.reward.money})
                          </button>
                        )}
                        {active && !done && !ready && (
                          <button className="jp-btn--pending" disabled title="Terminalden git push yaparak CI/CD doğrulamasını geçmelisiniz">
                            ⏳ Terminalde 'git push' Yapın
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Görev detay */
            <div className="jp-mission-detail">
              <button className="jp-detail-back" onClick={() => setSelectedMission(null)}>
                ← Görev Listesine Dön
              </button>
              <h3>{selectedMission.title}</h3>
              <p>{selectedMission.description}</p>

              {activeMissions.includes(selectedMission.id) && !completedMissions.includes(selectedMission.id) && (
                <div className="jp-git-box">
                  <div className="jp-git-box__header">
                    <span>💻 Klonlama Linki</span>
                    <button
                      className="jp-git-box__copy"
                      onClick={() => {
                        const gitUrl = `git clone git@devjobs.local:${selectedCompany.id}/${selectedMission.id}.git`;
                        navigator.clipboard?.writeText(gitUrl);
                        showNotification('📋 Git komutu panoya kopyalandı!');
                      }}
                    >
                      📋 Kopyala
                    </button>
                  </div>
                  <code className="jp-git-box__code">
                    git clone git@devjobs.local:{selectedCompany.id}/{selectedMission.id}.git
                  </code>
                </div>
              )}

              <div className="jp-detail-section">
                <h4>📊 Bilgiler</h4>
                <div className="jp-detail-grid">
                  <span>Zorluk:</span><span>{'⭐'.repeat(selectedMission.difficulty)}</span>
                  <span>Ödül:</span><span>₺{selectedMission.reward.money}</span>
                  <span>Kariyer Puanı:</span><span>{selectedMission.reward.careerPoints} KP</span>
                  <span>Aylık Bakım:</span><span>₺{selectedMission.reward.monthlyMaintenance}/ay</span>
                  <span>Süre Limiti:</span><span>{selectedMission.timeLimit} dk</span>
                </div>
              </div>

              <div className="jp-detail-section">
                <h4>📁 Repo Dosyaları</h4>
                <div className="jp-file-list">
                  {Object.keys(selectedMission.repoFiles).map((f) => (
                    <div key={f} className="jp-file-item">📄 {f}</div>
                  ))}
                </div>
              </div>

              <div className="jp-detail-section">
                <h4>💡 İpuçları</h4>
                <ul className="jp-hints">
                  {selectedMission.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              {!completedMissions.includes(selectedMission.id) && !activeMissions.includes(selectedMission.id) && (
                <button className="jp-accept-btn" onClick={() => handleAccept(selectedMission)}>
                  🚀 Görevi Kabul Et
                </button>
              )}
              {readyToDeliverMissions.includes(selectedMission.id) && (
                <button className="jp-accept-btn jp-btn--deliver" onClick={() => handleDeliver(selectedMission)}>
                  ✅ Görevi Teslim Et ve Ödülü Al (+₺{selectedMission.reward.money})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
