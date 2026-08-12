/**
 * TimeAndBarSync.test.js — Zaman hızı ve bar azalma senkronizasyon testi
 *
 * GÖREV 1 Doğrulama Testi:
 * 1 oyun-içi saat (60 dakika) ve 16x hızındaki 1 tick (16 oyun dakikası)
 * için barların tam olarak beklenen miktarda azaldığını doğrular.
 */

import { describe, it, expect } from 'vitest';
import { calculateBarDecay } from '../src/engine/BarEngine';
import { BARS, TIME } from '../src/config/gameBalance.config';

function initialBars() {
  return {
    sleep:  { current: 100, max: 100 },
    hunger: { current: 100, max: 100 },
    health: { current: 100, max: 100 },
    stress: { current: 0,   max: 100 },
  };
}

describe('Zaman Hızı ve Bar Azalma Senkronizasyonu (Faz 14)', () => {
  it('1 oyun-içi saat (60 dakika) geçtiğinde barlar tam oranlarda eksilmeli', () => {
    const bars = initialBars();
    const result = calculateBarDecay(bars, 60); // 60 oyun dakikası = 1 oyun saati

    // Beklenen azalma: DECAY_RATE * 60
    const expectedSleepDecay = BARS.DECAY_RATES.sleep * 60;   // 0.0333 * 60 = 2.0
    const expectedHungerDecay = BARS.DECAY_RATES.hunger * 60; // 0.10 * 60 = 6.0

    expect(result.sleep.current).toBeCloseTo(100 - expectedSleepDecay, 1);
    expect(result.hunger.current).toBeCloseTo(100 - expectedHungerDecay, 1);
  });

  it('1 gerçek saniyelik tick (5/60 oyun dakikası) sırasında sıçramalı/agresif azalma olmamalı', () => {
    const bars = initialBars();
    const minutesPerTick = TIME.GAME_MINUTES_PER_REAL_SECOND; // 0.08333
    const result = calculateBarDecay(bars, minutesPerTick);

    // 1 saniyede uyku barı 0.01 puanın altında azalmalı
    const sleepLoss = 100 - result.sleep.current;
    expect(sleepLoss).toBeLessThan(0.05);

    // 1 saniyede açlık barı 0.02 puanın altında azalmalı
    const hungerLoss = 100 - result.hunger.current;
    expect(hungerLoss).toBeLessThan(0.05);
  });

  it('16 oyun-içi saat (960 oyun dakikası = 192 gerçek saniye) boyunca uyku barı %60 civarına düşmeli', () => {
    let bars = initialBars();
    // 960 oyun dakikası
    bars = calculateBarDecay(bars, 960);

    // 16 saat uyanık kalan karakterin uykusu ~68 civarında kalmalı
    expect(bars.sleep.current).toBeGreaterThan(60);
    expect(bars.sleep.current).toBeLessThan(75);
  });
});
