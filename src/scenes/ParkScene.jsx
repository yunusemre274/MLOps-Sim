/**
 * ParkScene.jsx — Park sahnesi
 * Ücretsiz stres azaltma, sağlık bonusu.
 */
import LocationScene from './LocationScene';

export default function ParkScene() {
  return (
    <LocationScene
      locationId="park"
      icon="🌳"
      title="Park"
      description="Şehir parkında yürüyüş yap. Doğayla iç içe vakit geçir, stresini azalt."
      effects={[
        { icon: '😌', label: 'Stres -15', positive: true },
        { icon: '❤️', label: 'Sağlık +5', positive: true },
      ]}
      cost={0}
      duration={60}
    />
  );
}
