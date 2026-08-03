/**
 * OutdoorMenuScene.jsx — Dışarı menü sahnesi (placeholder)
 * Faz 3'te mekan seçenekleri (market, park, pub, sinema, galeri vb.) ile detaylandırılacak.
 */

import useGameStore from '../store/useGameStore';

export default function OutdoorMenuScene() {
  const setScene = useGameStore((s) => s.setScene);

  return (
    <div className="scene scene--outdoor">
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>🌆 Dışarı</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>
          Mekanlar Faz 3'te eklenecek.
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
