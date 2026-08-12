/**
 * BarEngine.js — Bar azalma/artma formülleri
 *
 * Tüm bar hesaplamaları bu modülde yapılır. Sabitler gameBalance.config.js'ten
 * alınır — burada sihirli sayı kullanılmaz.
 *
 * Barların birbirini etkileme kuralları:
 * - Uyku düşükken → stres daha hızlı artar
 * - Açlık düşükken → sağlık daha hızlı düşer
 * - Stres yüksekken → uyku kalitesi düşer (recovery azalır)
 * - Sağlık düşükken → tüm barlar daha hızlı düşer
 */

import { BARS } from '../config/gameBalance.config.js';

/**
 * Bir tick'te tüm barların yeni değerlerini hesaplar.
 * Çapraz etkileri (cross-effects) de uygular.
 *
 * @param {Object} bars - Mevcut bar durumu { sleep: {current, max}, ... }
 * @param {number} elapsedMinutes - Geçen oyun dakikası
 * @returns {Object} Yeni bar değerleri (aynı yapıda)
 */
export function calculateBarDecay(bars, elapsedMinutes) {
  const { DECAY_RATES, CROSS_EFFECTS } = BARS;

  // Mevcut değerleri al
  const sleep   = bars.sleep.current;
  const hunger  = bars.hunger.current;
  const health  = bars.health.current;
  const stress  = bars.stress.current;

  // --- Çarpan hesaplamaları ---

  // Sağlık düşükken tüm barlar daha hızlı düşer
  const globalMultiplier = health <= CROSS_EFFECTS.healthLowThreshold
    ? CROSS_EFFECTS.healthLowGlobalMultiplier
    : 1.0;

  // --- Her bar için delta hesaplama ---

  // Uyku azalması
  const sleepDelta = -DECAY_RATES.sleep * elapsedMinutes * globalMultiplier;

  // Açlık azalması
  const hungerDelta = -DECAY_RATES.hunger * elapsedMinutes * globalMultiplier;

  // Sağlık azalması — açlık düşükken hızlanır
  const hungerHealthMultiplier = hunger <= CROSS_EFFECTS.hungerLowThreshold
    ? CROSS_EFFECTS.hungerLowHealthMultiplier
    : 1.0;
  const healthDelta = -DECAY_RATES.health * elapsedMinutes * hungerHealthMultiplier * globalMultiplier;

  // Stres değişimi — normalde doğal olarak yavaşça azalır, uyku kritikse hafifçe artar
  let stressRate = DECAY_RATES.stress; // -0.0083
  if (sleep <= CROSS_EFFECTS.sleepLowThreshold) {
    stressRate = 0.02; // Düşük uykuda yavaşça artışa geçer
  }
  const stressDelta = stressRate * elapsedMinutes * globalMultiplier;

  // --- Yeni değerleri hesapla (0-max arasında clamp) ---
  return {
    sleep:  { ...bars.sleep,  current: clamp(sleep  + sleepDelta,  0, bars.sleep.max) },
    hunger: { ...bars.hunger, current: clamp(hunger + hungerDelta, 0, bars.hunger.max) },
    health: { ...bars.health, current: clamp(health + healthDelta, 0, bars.health.max) },
    stress: { ...bars.stress, current: clamp(stress + stressDelta, 0, bars.stress.max) },
  };
}

/**
 * Bir etkileşimin bar etkilerini uygular.
 *
 * @param {Object} bars - Mevcut bar durumu
 * @param {Object} effects - Uygulanacak etkiler { hunger: 25, stress: -10, ... }
 * @param {number} recoveryMultiplier - Konut bar toparlanma çarpanı (varsayılan 1.0)
 * @returns {Object} Yeni bar değerleri
 */
export function applyInteraction(bars, effects, recoveryMultiplier = 1.0) {
  const newBars = { ...bars };

  for (const [barName, delta] of Object.entries(effects)) {
    if (!newBars[barName]) {
      console.warn(`[BarEngine] Bilinmeyen bar: ${barName}`);
      continue;
    }

    // Pozitif etkiler (toparlanma) konut çarpanıyla artırılır
    const adjustedDelta = delta > 0 ? delta * recoveryMultiplier : delta;

    // Stres yüksekken uyku recovery'si azalır
    if (barName === 'sleep' && delta > 0) {
      const { CROSS_EFFECTS } = BARS;
      const stressMultiplier = bars.stress.current >= CROSS_EFFECTS.stressHighThreshold
        ? CROSS_EFFECTS.stressHighSleepRecoveryMultiplier
        : 1.0;
      const finalDelta = adjustedDelta * stressMultiplier;
      newBars[barName] = {
        ...newBars[barName],
        current: clamp(newBars[barName].current + finalDelta, 0, newBars[barName].max),
      };
    } else {
      newBars[barName] = {
        ...newBars[barName],
        current: clamp(newBars[barName].current + adjustedDelta, 0, newBars[barName].max),
      };
    }
  }

  return newBars;
}

/**
 * Bir barın durumunu (seviye) döndürür.
 * @returns {'critical' | 'low' | 'normal' | 'good'}
 */
export function getBarStatus(current, barName) {
  const { THRESHOLDS } = BARS;

  // Stres ters mantıkla çalışır — yüksek stres kötü
  if (barName === 'stress') {
    if (current >= (100 - THRESHOLDS.critical)) return 'critical';
    if (current >= (100 - THRESHOLDS.low)) return 'low';
    if (current <= THRESHOLDS.good) return 'good';
    return 'normal';
  }

  // Diğer barlar — düşük değer kötü
  if (current <= THRESHOLDS.critical) return 'critical';
  if (current <= THRESHOLDS.low) return 'low';
  if (current >= THRESHOLDS.good) return 'good';
  return 'normal';
}

// --- Yardımcı ---
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
