/**
 * BarEngine.test.js — Bar formülleri birim testleri
 *
 * Test edilen modül: src/engine/BarEngine.js
 * Kapsam: calculateBarDecay, applyInteraction, getBarStatus
 */

import { describe, it, expect } from 'vitest';
import { calculateBarDecay, applyInteraction, getBarStatus } from '../src/engine/BarEngine.js';

// --- Yardımcı: test için bar state oluşturucu ---
function makeBars(overrides = {}) {
  return {
    sleep:  { current: 100, max: 100 },
    hunger: { current: 100, max: 100 },
    health: { current: 100, max: 100 },
    stress: { current: 0,   max: 100 },
    ...overrides,
  };
}

// ============================================================
// calculateBarDecay testleri
// ============================================================
describe('calculateBarDecay', () => {
  it('barlar zamanla azalmalı (normal koşullar)', () => {
    const bars = makeBars();
    const result = calculateBarDecay(bars, 16); // 16 dakika = 1 tick

    // DECAY_RATES.stress = -0.0083: stres doğal olarak yavaşça azalır
    const stressBars = makeBars({ stress: { current: 50, max: 100 } });
    const stressResult = calculateBarDecay(stressBars, 16);
    expect(stressResult.stress.current).toBeLessThan(50);
  });

  it('barlar 0 altına düşmemeli', () => {
    const bars = makeBars({
      sleep:  { current: 0.1, max: 100 },
      hunger: { current: 0.1, max: 100 },
      health: { current: 0.1, max: 100 },
    });
    const result = calculateBarDecay(bars, 100);

    expect(result.sleep.current).toBeGreaterThanOrEqual(0);
    expect(result.hunger.current).toBeGreaterThanOrEqual(0);
    expect(result.health.current).toBeGreaterThanOrEqual(0);
  });

  it('barlar max değerini aşmamalı', () => {
    const bars = makeBars({
      stress: { current: 99.9, max: 100 },
    });
    const result = calculateBarDecay(bars, 100);

    expect(result.stress.current).toBeLessThanOrEqual(100);
  });

  it('geçen dakika 0 ise barlar değişmemeli', () => {
    const bars = makeBars();
    const result = calculateBarDecay(bars, 0);

    expect(result.sleep.current).toBe(100);
    expect(result.hunger.current).toBe(100);
    expect(result.health.current).toBe(100);
    expect(result.stress.current).toBe(0);
  });

  // --- Çapraz etkiler ---
  it('düşük uyku → stres daha hızlı artmalı', () => {
    const normalBars = makeBars({ stress: { current: 50, max: 100 } });
    const lowSleepBars = makeBars({
      sleep:  { current: 10, max: 100 }, // threshold (25) altında
      stress: { current: 50, max: 100 },
    });

    const normalResult = calculateBarDecay(normalBars, 16);
    const lowSleepResult = calculateBarDecay(lowSleepBars, 16);

    // Düşük uyku durumunda stres daha yüksek olmalı
    expect(lowSleepResult.stress.current).toBeGreaterThan(normalResult.stress.current);
  });

  it('düşük açlık → sağlık daha hızlı düşmeli', () => {
    const normalBars = makeBars();
    const lowHungerBars = makeBars({
      hunger: { current: 10, max: 100 }, // threshold (20) altında
    });

    const normalResult = calculateBarDecay(normalBars, 16);
    const lowHungerResult = calculateBarDecay(lowHungerBars, 16);

    // Düşük açlık durumunda sağlık daha çok düşmeli
    expect(lowHungerResult.health.current).toBeLessThan(normalResult.health.current);
  });

  it('düşük sağlık → tüm barlar daha hızlı düşmeli', () => {
    const normalBars = makeBars();
    const lowHealthBars = makeBars({
      health: { current: 10, max: 100 }, // threshold (20) altında
    });

    const normalResult = calculateBarDecay(normalBars, 16);
    const lowHealthResult = calculateBarDecay(lowHealthBars, 16);

    // Düşük sağlık durumunda uyku ve açlık daha çok düşmeli
    expect(lowHealthResult.sleep.current).toBeLessThan(normalResult.sleep.current);
    expect(lowHealthResult.hunger.current).toBeLessThan(normalResult.hunger.current);
  });
});

// ============================================================
// applyInteraction testleri
// ============================================================
describe('applyInteraction', () => {
  it('yemek yemek açlık barını artırmalı', () => {
    const bars = makeBars({ hunger: { current: 50, max: 100 } });
    const result = applyInteraction(bars, { hunger: 25, health: 5, stress: -2 });

    expect(result.hunger.current).toBe(75);
    // Health zaten 100 (max), +5 → clamp sonucu 100 kalır
    expect(result.health.current).toBeGreaterThanOrEqual(bars.health.current);
  });

  it('pozitif etkiler recoveryMultiplier ile artmalı', () => {
    const bars = makeBars({ hunger: { current: 50, max: 100 } });

    const normal = applyInteraction(bars, { hunger: 20 }, 1.0);
    const boosted = applyInteraction(bars, { hunger: 20 }, 1.5);

    expect(boosted.hunger.current).toBeGreaterThan(normal.hunger.current);
  });

  it('negatif etkiler recoveryMultiplier\'dan etkilenmemeli', () => {
    const bars = makeBars({ stress: { current: 50, max: 100 } });

    const normal = applyInteraction(bars, { stress: -10 }, 1.0);
    const boosted = applyInteraction(bars, { stress: -10 }, 1.5);

    // Negatif etki aynı kalmalı (multiplier sadece pozitif etkilere uygulanır)
    expect(boosted.stress.current).toBe(normal.stress.current);
  });

  it('uyku recovery\'si yüksek streste azalmalı', () => {
    const lowStressBars = makeBars({
      sleep: { current: 30, max: 100 },
      stress: { current: 20, max: 100 },
    });
    const highStressBars = makeBars({
      sleep: { current: 30, max: 100 },
      stress: { current: 80, max: 100 }, // threshold (75) üstünde
    });

    const lowStressResult = applyInteraction(lowStressBars, { sleep: 50 });
    const highStressResult = applyInteraction(highStressBars, { sleep: 50 });

    // Yüksek stresle uyku daha az toparlanmalı
    expect(highStressResult.sleep.current).toBeLessThan(lowStressResult.sleep.current);
  });

  it('bar değerleri 0-max arasında kalmalı', () => {
    const bars = makeBars({
      hunger: { current: 95, max: 100 },
      stress: { current: 5, max: 100 },
    });

    const result = applyInteraction(bars, { hunger: 50, stress: -50 });

    expect(result.hunger.current).toBe(100); // max clamp
    expect(result.stress.current).toBe(0);   // min clamp
  });

  it('bilinmeyen bar adı sessizce geçilmeli', () => {
    const bars = makeBars();
    // Hata fırlatmamalı
    const result = applyInteraction(bars, { nonexistent: 10 });
    expect(result.sleep.current).toBe(100);
  });
});

// ============================================================
// getBarStatus testleri
// ============================================================
describe('getBarStatus', () => {
  // Normal barlar (uyku, açlık, sağlık) — düşük = kötü
  it('kritik seviyeyi doğru tespit etmeli (≤15)', () => {
    expect(getBarStatus(10, 'sleep')).toBe('critical');
    expect(getBarStatus(15, 'hunger')).toBe('critical');
  });

  it('düşük seviyeyi doğru tespit etmeli (≤30)', () => {
    expect(getBarStatus(25, 'sleep')).toBe('low');
    expect(getBarStatus(30, 'health')).toBe('low');
  });

  it('iyi seviyeyi doğru tespit etmeli (≥70)', () => {
    expect(getBarStatus(80, 'sleep')).toBe('good');
    expect(getBarStatus(100, 'health')).toBe('good');
  });

  it('normal seviyeyi doğru tespit etmeli (31-69)', () => {
    expect(getBarStatus(50, 'hunger')).toBe('normal');
  });

  // Stres — ters mantık: yüksek = kötü
  it('yüksek stresi kritik olarak görmeli (≥85)', () => {
    expect(getBarStatus(90, 'stress')).toBe('critical');
  });

  it('orta stresi düşük olarak görmeli (≥70)', () => {
    expect(getBarStatus(75, 'stress')).toBe('low');
  });

  it('düşük stresi iyi olarak görmeli (≤70)', () => {
    expect(getBarStatus(30, 'stress')).toBe('good');
  });
});
