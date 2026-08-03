/**
 * PubScene.jsx — Pub sahnesi
 * Pahalı, yüksek stres azaltma, sağlık malus, alkol mekaniği.
 */
import LocationScene from './LocationScene';

export default function PubScene() {
  return (
    <LocationScene
      locationId="pub"
      icon="🍺"
      title="Pub"
      description="Bir bira iç, arkadaşlarla takıl. Stres atar ama cüzdan yanar ve sağlığına dikkat et."
      effects={[
        { icon: '😌', label: 'Stres -30', positive: true },
        { icon: '💔', label: 'Sağlık -5', positive: false },
        { icon: '💸', label: '₺40', positive: false },
      ]}
      cost={40}
      duration={120}
    />
  );
}
