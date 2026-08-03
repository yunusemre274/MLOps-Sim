/**
 * CinemaScene.jsx — Sinema sahnesi
 * Orta maliyet, stres azaltma.
 */
import LocationScene from './LocationScene';

export default function CinemaScene() {
  return (
    <LocationScene
      locationId="cinema"
      icon="🎬"
      title="Sinema"
      description="Yeni çıkan bir film izle. Kafanı dağıt, stresini azalt."
      effects={[
        { icon: '😌', label: 'Stres -20', positive: true },
        { icon: '💸', label: '₺25', positive: false },
      ]}
      cost={25}
      duration={150}
    />
  );
}
