/**
 * OutdoorMenuScene.jsx — Dışarı mekan seçim sahnesi
 *
 * Kapıdan çıkıldığında gösterilir. Oyuncu buradan mekanlara gider.
 * Kilitli mekanlar gri/devre dışı olarak gösterilir.
 * Plaza ve Şirket mekanları rütbe/durum ile açılır.
 */

import useGameStore from '../store/useGameStore';
import InteractiveItem from '../components/InteractiveItem';
import './OutdoorMenuScene.css';

const RANK_ORDER = ['junior', 'junior_plus', 'mid', 'mid_senior', 'senior', 'lead'];

export default function OutdoorMenuScene() {
  const setScene = useGameStore((s) => s.setScene);
  const rank = useGameStore((s) => s.character.rank);
  const ownCompany = useGameStore((s) => s.career.ownCompany);

  const rankIdx = RANK_ORDER.indexOf(rank);
  const plazaUnlocked = rankIdx >= 4; // senior+
  const companyUnlocked = !!ownCompany;

  const LOCATIONS = [
    { id: 'market',  icon: '🏪', label: 'Market',   targetScene: 'market',  locked: false },
    { id: 'park',    icon: '🌳', label: 'Park',     targetScene: 'park',    locked: false },
    { id: 'pub',     icon: '🍺', label: 'Pub',      targetScene: 'pub',     locked: false },
    { id: 'cinema',  icon: '🎬', label: 'Sinema',   targetScene: 'cinema',  locked: false },
    { id: 'gallery', icon: '🎨', label: 'Galeri',   targetScene: 'gallery', locked: false },
    { id: 'realtor', icon: '🏠', label: 'Emlakçı',  targetScene: 'realtor', locked: false },
    { id: 'plaza',   icon: '🏢', label: 'Plaza',    targetScene: 'plaza',   locked: !plazaUnlocked, unlockHint: 'Senior rütbe gerekli' },
    { id: 'company', icon: '🏗️', label: 'Şirketim', targetScene: 'plaza',   locked: !companyUnlocked, unlockHint: 'Önce şirket kur' },
  ];

  return (
    <div className="scene scene--outdoor">
      <div className="outdoor-header">
        <button className="outdoor-back" onClick={() => setScene('home')}>
          ← Eve Dön
        </button>
        <h2>🌆 Dışarı</h2>
      </div>

      <div className="outdoor-grid">
        {LOCATIONS.map((loc) => (
          <InteractiveItem
            key={loc.id}
            id={loc.id}
            icon={loc.icon}
            label={loc.label}
            disabled={loc.locked}
            tooltip={loc.locked ? `🔒 ${loc.unlockHint}` : loc.label}
            badge={loc.locked ? '🔒' : null}
            onClick={() => setScene(loc.targetScene)}
          />
        ))}
      </div>
    </div>
  );
}

