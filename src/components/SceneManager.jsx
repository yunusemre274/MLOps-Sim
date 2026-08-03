/**
 * SceneManager.jsx — Sahne yönetim bileşeni
 *
 * Neden var: Oyundaki tüm sahneler (ev, bilgisayar, dışarı, telefon vb.)
 * tek bir yönetici bileşen üzerinden kontrol edilir. Zustand store'daki
 * currentScene değerine göre hangi sahnenin render edileceğini belirler.
 *
 * Yeni sahne eklemek için: SCENE_MAP objesine sahne adı → bileşen eşlemesi ekle.
 */

import useGameStore from '../store/useGameStore';
import HomeScene from '../scenes/HomeScene';
import ComputerScene from '../scenes/ComputerScene';
import PhoneScene from '../scenes/PhoneScene';
import OutdoorMenuScene from '../scenes/OutdoorMenuScene';

// Sahne adı → bileşen eşlemesi
// Yeni sahneler eklendikçe buraya import + kayıt yapılır
const SCENE_MAP = {
  home: HomeScene,
  computer: ComputerScene,
  phone: PhoneScene,
  outdoor: OutdoorMenuScene,
  // Gelecekte eklenecek:
  // market: MarketScene,
  // park: ParkScene,
  // pub: PubScene,
  // cinema: CinemaScene,
  // gallery: GalleryScene,
  // realtor: RealtorScene,
};

export default function SceneManager() {
  const currentScene = useGameStore((state) => state.currentScene);

  const SceneComponent = SCENE_MAP[currentScene];

  if (!SceneComponent) {
    console.error(`[SceneManager] Bilinmeyen sahne: "${currentScene}"`);
    return (
      <div style={{ padding: '2rem', color: '#ff6b6b', textAlign: 'center' }}>
        ⚠️ Bilinmeyen sahne: <strong>{currentScene}</strong>
      </div>
    );
  }

  return <SceneComponent />;
}
