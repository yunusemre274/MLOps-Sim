/**
 * GalleryScene.jsx — Galeri sahnesi
 * Orta maliyet, stres azaltma, kültür puanı.
 */
import LocationScene from './LocationScene';

export default function GalleryScene() {
  return (
    <LocationScene
      locationId="gallery"
      icon="🎨"
      title="Galeri"
      description="Sanat galerisi gez, kültürel zenginliğine katkıda bulun."
      effects={[
        { icon: '😌', label: 'Stres -18', positive: true },
        { icon: '💸', label: '₺15', positive: false },
      ]}
      cost={15}
      duration={90}
    />
  );
}
