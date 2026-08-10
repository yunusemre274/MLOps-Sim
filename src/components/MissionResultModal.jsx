/**
 * MissionResultModal.jsx — Görev sonuç ekranı
 *
 * Görev teslim edildiğinde açılır. Puan, kontrol sonuçları ve ödül gösterilir.
 */

import './MissionResultModal.css';

export default function MissionResultModal({ mission, result, onClose }) {
  if (!mission || !result) return null;

  const percentage = Math.round((result.score / result.maxScore) * 100);

  return (
    <div className="mr-overlay" onClick={onClose}>
      <div className="mr-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`mr-header ${result.passed ? 'mr-header--pass' : 'mr-header--fail'}`}>
          <span className="mr-header__icon">{result.passed ? '🎉' : '❌'}</span>
          <h2>{result.passed ? 'Görev Tamamlandı!' : 'Görev Başarısız'}</h2>
        </div>

        <div className="mr-body">
          <h3>{mission.title}</h3>

          {/* Puan çubuğu */}
          <div className="mr-score">
            <div className="mr-score__bar">
              <div
                className="mr-score__fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="mr-score__text">{result.score}/{result.maxScore} ({percentage}%)</span>
          </div>

          {/* Kontrol sonuçları */}
          <div className="mr-checks">
            {result.checks.map((check, i) => (
              <div key={i} className={`mr-check ${check.passed ? 'mr-check--pass' : 'mr-check--fail'}`}>
                <span>{check.passed ? '✅' : '❌'}</span>
                <span>{check.name}</span>
                <span className="mr-check__points">{check.passed ? `+${check.points}` : '0'}</span>
              </div>
            ))}
          </div>

          {/* Ödüller */}
          {result.passed && (
            <div className="mr-rewards">
              <h4>🎁 Ödüller</h4>
              <div className="mr-reward-grid">
                <span>💰 Para:</span>
                <span>+₺{Math.floor(mission.reward.money * (result.score / result.maxScore))}</span>
                <span>📈 Kariyer:</span>
                <span>+{Math.floor(mission.reward.careerPoints * (result.score / result.maxScore))} KP</span>
                {mission.reward.monthlyMaintenance > 0 && (
                  <>
                    <span>💼 Bakım:</span>
                    <span>+₺{mission.reward.monthlyMaintenance}/ay</span>
                  </>
                )}
              </div>
            </div>
          )}

          {!result.passed && (
            <div className="mr-feedback">
              <p>%70 veya üzeri puan gerekli. İpuçlarını kontrol edip tekrar dene!</p>
            </div>
          )}
        </div>

        <button className="mr-close" onClick={onClose}>
          {result.passed ? '🎮 Devam Et' : '🔄 Tekrar Dene'}
        </button>
      </div>
    </div>
  );
}
