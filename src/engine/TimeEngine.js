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
 * Dakikayı saat string'ine çevirir: 870 → "14:30" (Her zaman 2 digit max, ondalıksız)
 */
export function minutesToTime(totalMinutes) {
  // 24 saat döngüsü (1440 dakika) — ondalık kısmı Math.floor ile temizle
  const wrapped = Math.floor(((totalMinutes % 1440) + 1440) % 1440);
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Oyun içi gün sayısını (dayCount) Gün / Ay / Yıl formatına çevirir.
 * Başlangıç: 01/01/2026
 * Gün ve Ay kesinlikle 2 basamaklı (01, 02..), Yıl 4 basamaklıdır.
 */
export function getFormattedDate(dayCount = 1) {
  const safeDay = Math.max(1, parseInt(dayCount, 10) || 1);
  const startDate = new Date(2026, 0, 1);
  const currentDate = new Date(startDate.getTime() + (safeDay - 1) * 24 * 60 * 60 * 1000);

  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();

  return {
    day,
    month,
    year,
    dateStr: `${day}/${month}/${year}`,
  };
}

/**
 * Tarih ve Saati birleşik formatta döndürür: "Gün/Ay/Yıl Saat:Dakika"
 * Örnek: "01/01/2026 08:06"
 */
export function getFullDateTime(dayCount = 1, currentTime = '08:00') {
  const { dateStr } = getFormattedDate(dayCount);
  const cleanTime = minutesToTime(timeToMinutes(currentTime));
  return `${dateStr} ${cleanTime}`;
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
