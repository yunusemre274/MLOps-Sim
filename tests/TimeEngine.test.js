/**
 * TimeEngine.test.js — Zaman motoru birim testleri
 *
 * Test edilen modül: src/engine/TimeEngine.js
 * Kapsam: timeToMinutes, minutesToTime, advanceTime, getTimePeriod, isNightTime
 */

import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTime,
  advanceTime,
  getMinutesPerTick,
  getTickInterval,
  isNightTime,
  getTimePeriod,
} from '../src/engine/TimeEngine.js';

// ============================================================
// timeToMinutes testleri
// ============================================================
describe('timeToMinutes', () => {
  it('gece yarısı 0 dakika olmalı', () => {
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('08:00 → 480 dakika', () => {
    expect(timeToMinutes('08:00')).toBe(480);
  });

  it('14:30 → 870 dakika', () => {
    expect(timeToMinutes('14:30')).toBe(870);
  });

  it('23:59 → 1439 dakika', () => {
    expect(timeToMinutes('23:59')).toBe(1439);
  });
});

// ============================================================
// minutesToTime testleri
// ============================================================
describe('minutesToTime', () => {
  it('0 dakika → 00:00', () => {
    expect(minutesToTime(0)).toBe('00:00');
  });

  it('480 dakika → 08:00', () => {
    expect(minutesToTime(480)).toBe('08:00');
  });

  it('870 dakika → 14:30', () => {
    expect(minutesToTime(870)).toBe('14:30');
  });

  it('1440+ dakika wrap olmalı (24 saat döngüsü)', () => {
    expect(minutesToTime(1440)).toBe('00:00');
    expect(minutesToTime(1500)).toBe('01:00');
  });

  it('negatif dakika doğru wrap olmalı', () => {
    expect(minutesToTime(-60)).toBe('23:00');
  });
});

// ============================================================
// advanceTime testleri
// ============================================================
describe('advanceTime', () => {
  it('normal zaman ilerlemesi', () => {
    const result = advanceTime('08:00', 60);
    expect(result.newTime).toBe('09:00');
    expect(result.dayEnded).toBe(false);
  });

  it('gece 02:00 sonrası gün bitmeli', () => {
    // 08:00 + 1080 dakika (18 saat) = 02:00 ertesi gün
    const result = advanceTime('08:00', 1080);
    expect(result.dayEnded).toBe(true);
  });

  it('gece 01:59 — gün henüz bitmemiş', () => {
    const result = advanceTime('08:00', 1079);
    expect(result.dayEnded).toBe(false);
  });

  it('16 dakikalık tick normal ilerlemeli', () => {
    const result = advanceTime('12:00', 16);
    expect(result.newTime).toBe('12:16');
    expect(result.dayEnded).toBe(false);
  });
});

// ============================================================
// getMinutesPerTick & getTickInterval
// ============================================================
describe('getMinutesPerTick & getTickInterval', () => {
  it('dakika/tick pozitif sayı olmalı', () => {
    expect(getMinutesPerTick()).toBeGreaterThan(0);
  });

  it('tick aralığı pozitif ms olmalı', () => {
    expect(getTickInterval()).toBeGreaterThan(0);
  });
});

// ============================================================
// isNightTime testleri
// ============================================================
describe('isNightTime', () => {
  it('gece 23:00 → true', () => {
    expect(isNightTime('23:00')).toBe(true);
  });

  it('gece 03:00 → true', () => {
    expect(isNightTime('03:00')).toBe(true);
  });

  it('gündüz 12:00 → false', () => {
    expect(isNightTime('12:00')).toBe(false);
  });

  it('sabah 08:00 → false (gün başlangıcı)', () => {
    expect(isNightTime('08:00')).toBe(false);
  });
});

// ============================================================
// getTimePeriod testleri
// ============================================================
describe('getTimePeriod', () => {
  it('sabah: 06:00-11:59', () => {
    expect(getTimePeriod('08:00')).toBe('morning');
    expect(getTimePeriod('11:30')).toBe('morning');
  });

  it('öğlen: 12:00-17:59', () => {
    expect(getTimePeriod('12:00')).toBe('afternoon');
    expect(getTimePeriod('15:30')).toBe('afternoon');
  });

  it('akşam: 18:00-21:59', () => {
    expect(getTimePeriod('18:00')).toBe('evening');
    expect(getTimePeriod('21:30')).toBe('evening');
  });

  it('gece: 22:00-05:59', () => {
    expect(getTimePeriod('23:00')).toBe('night');
    expect(getTimePeriod('02:00')).toBe('night');
  });
});
