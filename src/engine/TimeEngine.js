/**
 * TimeEngine.js — Zaman ilerleme motoru
 *
 * Oyun saatini yönetir. Her tick'te:
 * 1. Oyun saati ilerler (1 gerçek saniye = 16 oyun dakikası)
 * 2. Bar azalma/artma formülleri uygulanır (barEngine üzerinden)
 * 3. Gün bitişi kontrolü yapılır
 *
 * Neden ayrı modül: Zaman mantığı UI'dan bağımsız çalışır.
 * React bileşenlerinden useTimeEngine hook'u ile kullanılır.
 */

import { TIME } from '../config/gameBalance.config.js';

/**
 * Saat string'ini dakikaya çevirir: "14:30" → 870
 */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Dakikayı saat string'ine çevirir: 870 → "14:30"
 */
export function minutesToTime(totalMinutes) {
  // 24 saat döngüsü
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Belirli bir dakika kadar zaman ilerletir.
 * @param {string} currentTime - Mevcut saat ("HH:MM")
 * @param {number} minutes - İlerletilecek dakika
 * @returns {{ newTime: string, dayEnded: boolean }}
 */
export function advanceTime(currentTime, minutes) {
  const currentMinutes = timeToMinutes(currentTime);
  const newMinutes = currentMinutes + minutes;

  // Gün bitiş kontrolü: gece 02:00 (26 saat = 1560 dakika) sonrası
  const dayEndMinutes = TIME.DAY_END_HOUR * 60 + 24 * 60; // 02:00 ertesi gün = 1560
  const dayEnded = newMinutes >= dayEndMinutes;

  const newTime = minutesToTime(newMinutes);

  return { newTime, dayEnded };
}

/**
 * Bir tick'te kaç oyun dakikası geçtiğini hesaplar.
 * Varsayılan: 1 gerçek saniye = 16 oyun dakikası
 */
export function getMinutesPerTick() {
  return TIME.GAME_MINUTES_PER_REAL_SECOND;
}

/**
 * Tick aralığını döndürür (ms).
 */
export function getTickInterval() {
  return TIME.TICK_INTERVAL_MS;
}

/**
 * Mevcut saatin gece olup olmadığını kontrol eder.
 * Gece: 22:00 - 08:00 arası
 */
export function isNightTime(timeStr) {
  const minutes = timeToMinutes(timeStr);
  return minutes >= 22 * 60 || minutes < TIME.DAY_START_HOUR * 60;
}

/**
 * Gün içindeki zaman dilimini döndürür.
 * @returns {'morning' | 'afternoon' | 'evening' | 'night'}
 */
export function getTimePeriod(timeStr) {
  const minutes = timeToMinutes(timeStr);
  const hour = Math.floor(minutes / 60);

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}
