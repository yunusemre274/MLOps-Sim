/**
 * HomeScene.jsx — Ev içi sahnesi
 *
 * Oyuncunun günlük yaşamını yönettiği ana sahne. InteractiveItem bileşenleri
 * ile buzdolabı, yatak, bilgisayar, telefon, dolap ve kapıya erişim sağlar.
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import { applyInteraction } from '../engine/BarEngine';
import { advanceTime } from '../engine/TimeEngine';
import { BARS, TIME } from '../config/gameBalance.config.js';
import InteractiveItem from '../components/InteractiveItem';
import FridgeModal from '../components/FridgeModal';
import DaySummaryModal from '../components/DaySummaryModal';
import './HomeScene.css';

export default function HomeScene() {
  const setScene = useGameStore((s) => s.setScene);
  const bars = useGameStore((s) => s.bars);
  const fridge = useGameStore((s) => s.inventory.fridge);
  const currentTime = useGameStore((s) => s.currentTime);
  const housing = useGameStore((s) => s.housing);

  const [showFridge, setShowFridge] = useState(false);
  const [showDaySummary, setShowDaySummary] = useState(false);

  // --- Buzdolabı etkileşimi ---
  const handleFridgeClick = () => {
    setShowFridge(true);
  };

  const handleEat = (itemIndex) => {
    const state = useGameStore.getState();
    const newBars = applyInteraction(
      state.bars,
      BARS.INTERACTIONS.eat,
      state.housing.barRecoveryMultiplier
    );
    useGameStore.setState({ bars: newBars });

    // Buzdolabından yemeği çıkar
    useGameStore.getState().removeFromFridge(itemIndex);

    // Zaman ilerlet
    const { newTime, dayEnded } = advanceTime(state.currentTime, TIME.ACTIONS.eat);
    useGameStore.setState({ currentTime: newTime });
    if (dayEnded) triggerDaySummary();
  };

  // --- Yatak etkileşimi ---
  const handleSleep = () => {
    const state = useGameStore.getState();
    const newBars = applyInteraction(
      state.bars,
      BARS.INTERACTIONS.sleep,
      state.housing.barRecoveryMultiplier
    );
    useGameStore.setState({ bars: newBars });
    triggerDaySummary();
  };

  const handleNap = () => {
    const state = useGameStore.getState();
    const newBars = applyInteraction(
      state.bars,
      BARS.INTERACTIONS.shortNap,
      state.housing.barRecoveryMultiplier
    );
    const { newTime, dayEnded } = advanceTime(state.currentTime, TIME.ACTIONS.shortNap);
    useGameStore.setState({ bars: newBars, currentTime: newTime });
    if (dayEnded) triggerDaySummary();
  };

  // --- Gün sonu ---
  const triggerDaySummary = () => {
    useGameStore.setState({ isPaused: true });
    setShowDaySummary(true);
  };

  const handleDaySummaryClose = () => {
    setShowDaySummary(false);
    useGameStore.getState().advanceDay();
    useGameStore.setState({ isPaused: false });
  };

  return (
    <div className="scene scene--home">
      <div className="home-header">
        <h2>🏠 Evin</h2>
      </div>

      <div className="home-grid">
        <InteractiveItem
          id="computer"
          icon="💻"
          label="Bilgisayar"
          onClick={() => setScene('computer')}
        />
        <InteractiveItem
          id="phone"
          icon="📱"
          label="Telefon"
          onClick={() => setScene('phone')}
        />
        <InteractiveItem
          id="fridge"
          icon="🧊"
          label="Buzdolabı"
          badge={fridge.length > 0 ? fridge.length : null}
          onClick={handleFridgeClick}
        />
        <InteractiveItem
          id="bed"
          icon="🛏️"
          label="Yatak"
          tooltip="Uyumak için tıkla"
          onClick={handleSleep}
        />
        <InteractiveItem
          id="wardrobe"
          icon="👔"
          label="Dolap"
          disabled
          tooltip="Yakında..."
        />
        <InteractiveItem
          id="door"
          icon="🚪"
          label="Kapı"
          onClick={() => setScene('outdoor')}
        />
      </div>

      {/* Buzdolabı Modalı */}
      {showFridge && (
        <FridgeModal
          items={fridge}
          onEat={handleEat}
          onClose={() => setShowFridge(false)}
        />
      )}

      {/* Gün Sonu Özeti */}
      {showDaySummary && (
        <DaySummaryModal onClose={handleDaySummaryClose} />
      )}
    </div>
  );
}
