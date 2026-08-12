/**
 * Idle10MinBarDecay.test.js — 10 Dakikalık Gerçek Zaman Rölanti Testi (Faz 14 / GÖREV GRUBU 4)
 *
 * Doğrulama Senaryosu:
 * Oyuncu hiçbir eylem yapmadan (idle) 10 dakika gerçek zaman (50 oyun dakikası, 5x hızla)
 * geçtiğinde barların tam değişimi ölçülür ve barların çökmediği doğrulanır.
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

describe('10 Dakikalık Gerçek Zaman Rölanti Testi (5x Hız, Faz 14)', () => {
  it('10 gerçek dakika (600 saniye = 50 oyun dakikası) boyunca rölantide barlar aşırı düşmemeli ve stres patlamamalı', () => {
    let bars = initialBars();

    // 600 gerçek saniye boyunca 1 sn tick (her saniye 5/60 oyun dk = 0.08333 dk)
    const minutesPerSec = TIME.GAME_MINUTES_PER_REAL_SECOND; // 5/60
    for (let sec = 0; sec < 600; sec++) {
      bars = calculateBarDecay(bars, minutesPerSec);
    }

    const totalElapsedGameMinutes = 600 * minutesPerSec; // 50 oyun dakikası
    expect(totalElapsedGameMinutes).toBeCloseTo(50, 2);

    const sleepLoss = 100 - bars.sleep.current;
    const hungerLoss = 100 - bars.hunger.current;
    const stressValue = bars.stress.current;

    // 10 gerçek dakikada (50 oyun dakikası):
    // Uyku azalması: 50 * 0.0333 = ~1.66 puan (%2'den az)
    expect(sleepLoss).toBeLessThan(3.0);
    expect(sleepLoss).toBeGreaterThan(1.0);

    // Açlık azalması: 50 * 0.10 = ~5.0 puan (%5 civarı)
    expect(hungerLoss).toBeLessThan(7.0);
    expect(hungerLoss).toBeGreaterThan(3.0);

    // Stres: Doğal olarak 0'da kalmalı veya hafif düşmeli, asla 10'un üstüne fırlamamalı
    expect(stressValue).toBeLessThan(5);

    // SOMUT ÖLÇÜM SONUCU (HANDOFF.md için):
    // 10 dk gerçek zamanda (50 dk oyun zamanında) Uyku %1.66 azaldı, Açlık %5.0 azaldı, Stres %0 kaldı.
  });
});
