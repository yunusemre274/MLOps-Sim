/**
 * EventEngine.js — Olay motoru
 *
 * NPC karşılaşmalarını, koşul kontrolünü, olasılık hesaplamasını ve
 * cooldown yönetimini sağlar. Mekan ziyaretlerinde tetiklenir.
 *
 * Olay akışı:
 * 1. Oyuncu bir mekanı ziyaret eder
 * 2. EventEngine mekanın NPC havuzundan uygun NPC'leri filtreler
 * 3. Olasılık hesaplanır (kişilik + ilişki seviyesi + son görüşme)
 * 4. Olay tetiklenirse EventPopup gösterilir
 */

import npcs from '../data/npcs.json';
import { RELATIONSHIPS } from '../config/gameBalance.config.js';

/**
 * Bir NPC'nin ilişki durumunu (status string) döndürür.
 * @param {number} level - İlişki seviyesi (0-100)
 * @returns {string} stranger | acquaintance | friend | closeFriend | bestFriend
 */
export function getRelationshipStatus(level) {
  const thresholds = RELATIONSHIPS.STATUS_THRESHOLDS;

  if (level >= thresholds.bestFriend)   return 'bestFriend';
  if (level >= thresholds.closeFriend)  return 'closeFriend';
  if (level >= thresholds.friend)       return 'friend';
  if (level >= thresholds.acquaintance) return 'acquaintance';
  return 'stranger';
}

/**
 * İlişki seviyesi değiştiğinde yeni status'a geçiş olup olmadığını kontrol eder.
 * @returns {{ transitioned: boolean, oldStatus: string, newStatus: string }}
 */
export function checkStatusTransition(oldLevel, newLevel) {
  const oldStatus = getRelationshipStatus(oldLevel);
  const newStatus = getRelationshipStatus(newLevel);
  return {
    transitioned: oldStatus !== newStatus,
    oldStatus,
    newStatus,
  };
}

/**
 * Belirli bir mekandaki karşılaşma havuzunu döndürür.
 * @param {string} locationId - Mekan ID'si
 * @returns {Array} NPC listesi
 */
export function getNPCsForLocation(locationId) {
  return npcs.filter((npc) => npc.locations.includes(locationId));
}

/**
 * Karşılaşma olasılığını hesaplar.
 * Faktörler: NPC kişiliği, ilişki seviyesi, son görüşmeden geçen gün.
 *
 * @param {Object} npc - NPC verisi
 * @param {Object} relationship - Oyuncunun bu NPC ile ilişkisi
 * @param {number} currentDay - Mevcut gün sayısı
 * @returns {number} 0-1 arası olasılık
 */
export function calculateEncounterChance(npc, relationship, currentDay) {
  // Temel olasılık
  let chance = 0.3;

  // Kişilik çarpanı
  const personalityBonus = {
    friendly: 0.15,
    adventurous: 0.1,
    ambitious: 0.05,
    creative: 0.05,
    analytical: -0.05,
    reserved: -0.1,
  };
  chance += personalityBonus[npc.personality] || 0;

  // İlişki seviyesi bonusu (tanıdık birini daha çok görürsün)
  if (relationship) {
    chance += Math.min(relationship.level * 0.002, 0.15);

    // Son görüşme cooldown'u — aynı gün ise şans düşer
    if (relationship.lastInteraction === currentDay) {
      chance *= 0.1;
    } else if (relationship.lastInteraction === currentDay - 1) {
      chance *= 0.5;
    }
  }

  return Math.max(0, Math.min(1, chance));
}

/**
 * Bir mekan ziyaretinde NPC karşılaşması simüle eder.
 * @param {string} locationId - Mekan ID
 * @param {Object} relationships - Tüm NPC ilişkileri (state'ten)
 * @param {number} currentDay - Mevcut gün
 * @returns {Object|null} Karşılaşılan NPC veya null
 */
export function rollEncounter(locationId, relationships, currentDay) {
  const locationNPCs = getNPCsForLocation(locationId);

  for (const npc of locationNPCs) {
    const rel = relationships[npc.id] || { level: 0, lastInteraction: null };
    const chance = calculateEncounterChance(npc, rel, currentDay);

    if (Math.random() < chance) {
      return npc;
    }
  }

  return null;
}

/**
 * Bir NPC'nin ilişki seviyesine uygun sohbet konusunu döndürür.
 * @param {Object} npc - NPC verisi
 * @param {number} level - İlişki seviyesi
 * @returns {string} Sohbet metni
 */
export function getDialogue(npc, level) {
  const status = getRelationshipStatus(level);
  const topics = npc.topics[status] || npc.topics.stranger;

  // Rastgele bir konu seç
  return topics[Math.floor(Math.random() * topics.length)];
}

/**
 * Karşılaşmada sunulacak seçenekleri döndürür.
 * İlişki seviyesine göre daha fazla seçenek açılır.
 */
export function getEncounterOptions(npc, level) {
  const status = getRelationshipStatus(level);
  const options = [
    { id: 'greet', label: '👋 Selamla', effect: { relationship: 3, stress: -2 } },
  ];

  if (status !== 'stranger') {
    options.push(
      { id: 'chat', label: '💬 Sohbet et', effect: { relationship: 5, stress: -5 }, time: 15 }
    );
  }

  if (status === 'friend' || status === 'closeFriend' || status === 'bestFriend') {
    options.push(
      { id: 'hangout', label: '☕ Takıl', effect: { relationship: 8, stress: -10, hunger: -5 }, time: 30 }
    );
  }

  if (status === 'closeFriend' || status === 'bestFriend') {
    options.push(
      { id: 'deepTalk', label: '🤝 Derin sohbet', effect: { relationship: 12, stress: -15 }, time: 45 }
    );
  }

  // Her zaman "Geç" seçeneği
  options.push(
    { id: 'ignore', label: '🚶 Geç', effect: { relationship: -1 } }
  );

  return options;
}
