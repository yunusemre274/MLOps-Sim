/**
 * ComputerScene.jsx — Bilgisayar sahnesi (placeholder)
 * Faz 5'te terminal/editör/tarayıcı sekmeleri ile detaylandırılacak.
 */

import useGameStore from '../store/useGameStore';

export default function ComputerScene() {
  const setScene = useGameStore((s) => s.setScene);

  return (
    <div className="scene scene--computer">
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>💻 Bilgisayar</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>
          Terminal ve editör Faz 5'te eklenecek.
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
