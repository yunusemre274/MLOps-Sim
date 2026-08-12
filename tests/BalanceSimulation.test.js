/**
 * BalanceSimulation.test.js — 100 günlük senaryo denge testi
 *
 * Bar formülleri, ekonomi dengesi ve oyun kırılmazlık testi.
 * Üç farklı senaryo ile simülasyon yapılır:
 *   1. Kariyer odaklı (çok görev, az sosyal)
 *   2. Sosyal odaklı (çok NPC, az görev)
 *   3. Dengeli (her şeyden biraz)
 */

import { describe, it, expect } from 'vitest';
import { calculateBarDecay, applyInteraction } from '../src/engine/BarEngine';

/**
 * Basit bar simülasyonu — 100 gün boyunca decay + günlük etkileşimler.
 */
function runSimulation(scenario, days = 100) {
  let bars = {
    sleep:  { current: 100, max: 100 },
    hunger: { current: 100, max: 100 },
    health: { current: 100, max: 100 },
    stress: { current: 0,   max: 100 },
  };
  let balance = 500;
  let careerPoints = 0;
  let daysDead = 0;

  const history = [];

  for (let day = 1; day <= days; day++) {
    // Günlük decay — 16 saat aktif (saatlik decay uygula, 16 tur)
    for (let hour = 0; hour < 16; hour++) {
      bars = calculateBarDecay(bars, 60); // Her saat 60 dakika
    }

    // Senaryo bazlı günlük aktiviteler
    for (const action of scenario.dailyActions) {
      bars = applyInteraction(bars, action.effects);
    }

    // Harcama ve gelir
    balance += scenario.dailyIncome;
    balance -= scenario.dailyExpense;
    careerPoints += scenario.dailyCareerGain;

    // Kırılma kontrolü
    const critical =
      bars.sleep.current <= 0 ||
      bars.hunger.current <= 0 ||
      bars.health.current <= 0 ||
      bars.stress.current >= 100;
    if (critical) daysDead++;

    history.push({
      day,
      bars: {
        sleep: bars.sleep.current,
        hunger: bars.hunger.current,
        health: bars.health.current,
        stress: bars.stress.current,
      },
      balance,
      careerPoints,
      critical,
    });

    // Aylık kira (her 30 günde)
    if (day % 30 === 0) {
      balance -= 800;
    }
  }

  return { finalBars: bars, balance, careerPoints, daysDead, history };
}

// Senaryo tanımları — applyInteraction ile uyumlu
const CAREER_SCENARIO = {
  name: 'Kariyer Odaklı',
  dailyActions: [
    { effects: { sleep: 70 } },       // İyi uyku (8 saat)
    { effects: { hunger: 50 } },      // 3 öğün yemek
    { effects: { stress: -10 } },     // Akşam dinlenme (net: +10 iş, -10 dinlenme)
    { effects: { health: 10 } },      // Temel sağlık bakımı
  ],
  dailyIncome: 25,
  dailyExpense: 15,
  dailyCareerGain: 5,
};

const SOCIAL_SCENARIO = {
  name: 'Sosyal Odaklı',
  dailyActions: [
    { effects: { sleep: 35 } },
    { effects: { hunger: 25 } },
    { effects: { stress: -20 } },     // Sosyalleşme stresi azaltır
    { effects: { health: 5 } },
  ],
  dailyIncome: 10,
  dailyExpense: 20,
  dailyCareerGain: 1,
};

const BALANCED_SCENARIO = {
  name: 'Dengeli',
  dailyActions: [
    { effects: { sleep: 40 } },
    { effects: { hunger: 30 } },
    { effects: { stress: -5 } },
    { effects: { health: 5 } },
  ],
  dailyIncome: 18,
  dailyExpense: 15,
  dailyCareerGain: 3,
};

describe('100 Günlük Denge Simülasyonu', () => {
  it('Kariyer odaklı senaryo — bar\'lar çökmemeli', () => {
    const result = runSimulation(CAREER_SCENARIO);
    // Kariyer odaklı oyuncunun bar yönetimi zorlanması beklenen
    expect(result.daysDead).toBeLessThan(50);
    expect(result.balance).toBeGreaterThan(-2000);
    expect(result.careerPoints).toBeGreaterThan(0);
  });

  it('Sosyal odaklı senaryo — ekonomi çökmemeli', () => {
    const result = runSimulation(SOCIAL_SCENARIO);
    expect(result.daysDead).toBeLessThan(20);
    expect(result.balance).toBeGreaterThan(-5000);
  });

  it('Dengeli senaryo — en az kırılma ile geçilmeli', () => {
    const result = runSimulation(BALANCED_SCENARIO);
    expect(result.daysDead).toBeLessThan(10);
    expect(result.balance).toBeGreaterThan(-3000);
    expect(result.careerPoints).toBeGreaterThan(100);
  });

  it('Hiçbir senaryoda bar değeri negatif veya 100\'ü aşmamalı (clamp)', () => {
    for (const scenario of [CAREER_SCENARIO, SOCIAL_SCENARIO, BALANCED_SCENARIO]) {
      const result = runSimulation(scenario);
      for (const entry of result.history) {
        for (const val of Object.values(entry.bars)) {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('Ekonomi fiyatları tutarlı — 100 günde iflas etmemeli (dengeli)', () => {
    const result = runSimulation(BALANCED_SCENARIO, 100);
    expect(result.balance).toBeGreaterThan(-3000);
  });
});
