/**
 * AIFeedbackCard.jsx — AI değerlendirme kartı
 *
 * Görev tesliminde AI'dan gelen pedagojik feedback'i gösterir.
 * Güçlü yönler, iyileştirme alanları ve ipuçları listelenir.
 */

import { useState, useEffect } from 'react';
import { evaluateWithAI, isAIAvailable } from '../engine/AIService';
import './AIFeedbackCard.css';

export default function AIFeedbackCard({ dockerfileContent, mission, ruleBasedResult }) {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const aiAvailable = isAIAvailable();

  const handleEvaluate = async () => {
    setLoading(true);
    const result = await evaluateWithAI(dockerfileContent, mission, ruleBasedResult);
    setFeedback(result);
    setLoading(false);
    setExpanded(true);
  };

  // AI yoksa kural tabanlı feedback otomatik göster
  useEffect(() => {
    if (!aiAvailable && ruleBasedResult) {
      setFeedback({
        source: 'rule_based',
        summary: ruleBasedResult.passed
          ? 'Dockerfile temel kriterleri karşılıyor. ✅'
          : 'Dockerfile bazı kriterleri karşılamıyor.',
        strengths: ruleBasedResult.checks.filter((c) => c.passed).map((c) => c.name),
        improvements: ruleBasedResult.checks.filter((c) => !c.passed).map((c) => c.name),
        tips: mission?.hints || [],
      });
      setExpanded(true);
    }
  }, [aiAvailable, ruleBasedResult]);

  return (
    <div className="ai-feedback">
      <div className="ai-feedback__header" onClick={() => feedback && setExpanded(!expanded)}>
        <span className="ai-feedback__icon">
          {feedback?.source === 'ai' ? '🤖' : '📋'}
        </span>
        <h4>
          {feedback?.source === 'ai' ? 'AI Değerlendirmesi' : 'Değerlendirme'}
        </h4>
        {aiAvailable && !feedback && (
          <button
            className="ai-feedback__trigger"
            onClick={(e) => { e.stopPropagation(); handleEvaluate(); }}
            disabled={loading}
          >
            {loading ? '⏳ Değerlendiriliyor...' : '🤖 AI ile Değerlendir'}
          </button>
        )}
        {feedback && (
          <span className="ai-feedback__toggle">{expanded ? '▲' : '▼'}</span>
        )}
      </div>

      {expanded && feedback && (
        <div className="ai-feedback__body">
          {/* Özet */}
          <div className="ai-feedback__summary">
            {feedback.summary}
          </div>

          {/* Güçlü yönler */}
          {feedback.strengths?.length > 0 && (
            <div className="ai-feedback__section ai-feedback__section--good">
              <h5>✅ Güçlü Yönler</h5>
              <ul>
                {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {/* İyileştirme alanları */}
          {feedback.improvements?.length > 0 && (
            <div className="ai-feedback__section ai-feedback__section--improve">
              <h5>🔧 İyileştirme Alanları</h5>
              <ul>
                {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {/* İpuçları */}
          {feedback.tips?.length > 0 && (
            <div className="ai-feedback__section ai-feedback__section--tips">
              <h5>💡 İpuçları</h5>
              <ul>
                {feedback.tips.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {/* Kaynak bilgisi */}
          <div className="ai-feedback__source">
            {feedback.source === 'ai'
              ? '🤖 OpenAI tarafından değerlendirildi'
              : '📋 Kural tabanlı değerlendirme (AI kullanılamadı)'}
          </div>
        </div>
      )}
    </div>
  );
}
