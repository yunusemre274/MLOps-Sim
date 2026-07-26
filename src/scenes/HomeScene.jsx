/**
 * HomeScene.jsx — Ev içi sahnesi
 *
 * Oyuncunun günlük yaşamını yönettiği ana sahne. Tıklanabilir kutucuklarla
 * farklı etkileşimlere (buzdolabı, yatak, bilgisayar, telefon, dolap, kapı)
 * erişim sağlar.
 *
 * Bu aşamada (Faz 0) kutucuklar placeholder olarak görünür.
 * Faz 2'de InteractiveItem bileşeni ile tam etkileşim eklenecek.
 */

import useGameStore from '../store/useGameStore';
import './HomeScene.css';

// Ev içi kutucuk tanımları
// Faz 2'de her biri InteractiveItem bileşeniyle sarmalanacak
const HOME_ITEMS = [
  { id: 'computer',  icon: '💻', label: 'Bilgisayar', targetScene: 'computer' },
  { id: 'phone',     icon: '📱', label: 'Telefon',    targetScene: 'phone' },
  { id: 'fridge',    icon: '🧊', label: 'Buzdolabı',  targetScene: null },
  { id: 'bed',       icon: '🛏️', label: 'Yatak',      targetScene: null },
  { id: 'wardrobe',  icon: '👔', label: 'Dolap',      targetScene: null },
  { id: 'door',      icon: '🚪', label: 'Kapı',       targetScene: 'outdoor' },
];

export default function HomeScene() {
  const setScene = useGameStore((state) => state.setScene);

  const handleItemClick = (item) => {
    if (item.targetScene) {
      setScene(item.targetScene);
    }
    // Faz 2'de buzdolabı, yatak vb. etkileşimleri buraya eklenecek
  };

  return (
    <div className="scene scene--home">
      <div className="home-header">
        <h2>🏠 Evin</h2>
      </div>

      <div className="home-grid">
        {HOME_ITEMS.map((item) => (
          <button
            key={item.id}
            className="home-item"
            onClick={() => handleItemClick(item)}
            title={item.label}
          >
            <span className="home-item__icon">{item.icon}</span>
            <span className="home-item__label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
