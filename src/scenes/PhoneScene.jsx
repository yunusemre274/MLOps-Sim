/**
 * PhoneScene.jsx — Telefon sahnesi (placeholder)
 * Faz 4'te NPC mesajlaşma, Faz 10'da genişletilecek.
 */

import useGameStore from '../store/useGameStore';

export default function PhoneScene() {
  const setScene = useGameStore((s) => s.setScene);

  return (
    <div className="scene scene--phone">
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>📱 Telefon</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>
          Mesajlaşma ve uygulamalar Faz 4'te eklenecek.
        </p>
        <button
          style={{ marginTop: '2rem', padding: '0.5rem 1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', cursor: 'pointer' }}
          onClick={() => setScene('home')}
        >
          ← Eve Dön
        </button>
      </div>
    </div>
  );
}
