/**
 * LocationEngine.js — Mekan etkileşim motoru
 *
 * Mekan ziyaretinde bar efektlerini, para değişimini ve zaman tüketimini
 * uygulayan yardımcı fonksiyonlar. gameBalance.config.js'teki LOCATIONS ve
 * TIME sabitlerini kullanır.
 */

import { LOCATIONS, TIME, SUBSTANCES } from '../config/gameBalance.config.js';
import { applyInteraction } from './BarEngine.js';
import { advanceTime } from './TimeEngine.js';
import useGameStore from '../store/useGameStore.js';

/**
 * Bir mekan ziyaretinin tüm etkilerini uygular.
 * @param {string} locationId - Mekan adı (park, pub, cinema, gallery)
 * @returns {{ success: boolean, message: string, dayEnded: boolean }}
 */
export function visitLocation(locationId) {
  const effects = LOCATIONS[locationId];
  if (!effects) {
    console.warn(`[LocationEngine] Bilinmeyen mekan: ${locationId}`);
    return { success: false, message: 'Bilinmeyen mekan', dayEnded: false };
  }

  const state = useGameStore.getState();

  // Para kontrolü
  const cost = Math.abs(effects.money || 0);
  if (cost > 0 && state.finance.balance < cost) {
    return { success: false, message: 'Yeterli paran yok!', dayEnded: false };
  }

  // Bar efektlerini uygula
  const barEffects = {};
  if (effects.stress !== undefined) barEffects.stress = effects.stress;
  if (effects.health !== undefined) barEffects.health = effects.health;

  const newBars = applyInteraction(
    state.bars,
    barEffects,
    state.housing.barRecoveryMultiplier
  );

  // Para düşür
  const newBalance = state.finance.balance + (effects.money || 0);

  // Zaman ilerlet
  const actionKey = `goTo${locationId.charAt(0).toUpperCase() + locationId.slice(1)}`;
  const timeToSpend = TIME.ACTIONS[actionKey] || 60;
  const { newTime, dayEnded } = advanceTime(state.currentTime, timeToSpend);

  // Store'u güncelle
  useGameStore.setState({
    bars: newBars,
    finance: { ...state.finance, balance: newBalance },
    currentTime: newTime,
  });

  // Olay kaydet
  useGameStore.getState().addEvent(`${locationId} ziyaret edildi`);

  return { success: true, message: `${locationId} ziyaret edildi`, dayEnded };
}

/**
 * Sigara kullanım etkilerini uygular.
 * @returns {{ success: boolean, message: string }}
 */
export function useSubstance(type) {
  const config = SUBSTANCES[type];
  if (!config) {
    return { success: false, message: 'Bilinmeyen madde' };
  }

  const state = useGameStore.getState();

  // Bar efektleri
  const barEffects = { stress: config.immediateStress };
  if (config.hungerIncrease) barEffects.hunger = -config.hungerIncrease;

  const newBars = applyInteraction(state.bars, barEffects);

  // Kümülatif sağlık hasarı
  const newSubstanceUse = { ...state.substanceUse };
  if (type === 'cigarette') {
    newSubstanceUse.cigaretteUseCount += 1;
  } else if (type === 'alcohol') {
    newSubstanceUse.alcoholUseCount += 1;
  }
  newSubstanceUse.healthPenaltyAccumulated += config.healthPenalty;

  // Sağlığa kümülatif hasar uygula
  const healthBar = { ...newBars.health };
  healthBar.current = Math.max(0, healthBar.current - config.healthPenalty);
  newBars.health = healthBar;

  // Odak bonusu (sigara)
  if (config.focusBonusDuration > 0) {
    newSubstanceUse.focusBonusActive = true;
    // Timer süresi dakika cinsinden — TimeEngine ile takip edilecek
    newSubstanceUse.focusBonusExpiresAt = config.focusBonusDuration;
  }

  // Zaman tüketimi
  const timeKey = type === 'cigarette' ? 'smoke' : 'drink';
  const { newTime, dayEnded } = advanceTime(state.currentTime, TIME.ACTIONS[timeKey] || 10);

  useGameStore.setState({
    bars: newBars,
    substanceUse: newSubstanceUse,
    currentTime: newTime,
  });

  useGameStore.getState().addEvent(`${type === 'cigarette' ? 'Sigara içildi' : 'Alkol alındı'}`);

  return { success: true, message: type === 'cigarette' ? 'Sigara içildi' : 'Alkol alındı', dayEnded };
}

/**
 * Aylık kira ödemesini uygular.
 * @returns {{ success: boolean, remaining: number }}
 */
export function payMonthlyRent() {
  const state = useGameStore.getState();
  const rent = state.housing.monthlyRent;

  const newBalance = state.finance.balance - rent;

  useGameStore.setState({
    finance: {
      ...state.finance,
      balance: newBalance,
    },
  });

  useGameStore.getState().addEvent(`Kira ödendi: ₺${rent}`);

  return { success: newBalance >= 0, remaining: newBalance };
}
