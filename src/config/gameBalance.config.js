/**
 * gameBalance.config.js — Tüm oyun denge sabitleri
 *
 * Neden tek dosya: Bar azalma/artma oranları, etkileşim katsayıları, fiyatlar ve
 * eşik değerleri tek noktadan yönetilir. Playtesting sırasında hızlı denge
 * ayarlaması yapılabilir — birden fazla dosyayı düzenlemeye gerek kalmaz.
 *
 * KURAL: Bu dosya dışında hiçbir yerde sihirli sayı (magic number) kullanılmaz.
 * (.claude/RULES.md Kural 10, .claude/CODE_QUALITY.md Prensip 3)
 */

// === ZAMAN SİSTEMİ ===
export const TIME = {
  // Oyun hızı: 5x çarpanı (1 oyun dakikası = 12 gerçek saniye -> 1 gerçek saniyede 1/12 = 0.0833 oyun dk)
  GAME_TIME_MULTIPLIER: 5,
  GAME_MINUTES_PER_REAL_SECOND: 5 / 60,

  // Tick aralığı (ms) — her tick'te barlar güncellenir
  TICK_INTERVAL_MS: 1000,

  // Gün başlangıç/bitiş saatleri
  DAY_START_HOUR: 8,
  DAY_END_HOUR: 2, // Gece 02:00 — ertesi gün
  ACTIONS: {
    eat: 15,
    sleep: 480,       // 8 saat
    shortNap: 120,    // 2 saat
    goToMarket: 30,
    goToPark: 60,
    goToPub: 120,
    goToCinema: 150,
    goToGallery: 90,
    smoke: 10,
    drink: 20,
    useComputer: 0,
    usePhone: 0,
  },
};

// === BAR SİSTEMİ ===
export const BARS = {
  // Dakika başına azalma oranları (5x zaman çarpanı ile uygulanır)
  DECAY_RATES: {
    sleep:   0.0333, // Saat başına 2.0 puan (16 uyanık saat = 32 puan azalma)
    hunger:  0.10,   // Saat başına 6.0 puan (8 saat = 48 puan azalma -> kritik seviye)
    health:  0.0033, // Saat başına 0.2 puan
    stress:  -0.0083, // Saat başına 0.5 puan doğal rahatlama (negatif = azalma)
  },

  // Eşik değerleri — kritik seviyeler
  THRESHOLDS: {
    critical: 15,   // Bu seviyenin altında kırmızı uyarı
    low: 30,        // Bu seviyenin altında sarı uyarı
    good: 70,       // Bu seviyenin üstünde yeşil gösterge
  },

  // Barların birbirini etkilemesi
  CROSS_EFFECTS: {
    // Uyku düşükken stres artış hızı çarpanı
    sleepLowStressMultiplier: 1.5,
    sleepLowThreshold: 25,

    // Açlık düşükken sağlık düşüş hızı çarpanı
    hungerLowHealthMultiplier: 2.0,
    hungerLowThreshold: 20,

    // Stres yüksekken uyku kalitesi düşer (recovery çarpanı)
    stressHighSleepRecoveryMultiplier: 0.7,
    stressHighThreshold: 75,

    // Sağlık düşükken tüm barlar daha hızlı düşer
    healthLowGlobalMultiplier: 1.3,
    healthLowThreshold: 20,
  },

  // Etkileşim etkileri — her aksiyon barları ne kadar etkiler
  INTERACTIONS: {
    eat: {
      hunger: 25,    // Açlık barı +25
      health: 5,     // Sağlık barı +5 (beslenme etkisi)
      stress: -2,    // Stres hafifçe düşer
    },
    sleep: {
      sleep: 100,    // Tam uyku — bar tamamen dolar
      stress: -15,   // Uyku stresi azaltır
      health: 5,     // Uyku sağlığı iyileştirir
    },
    shortNap: {
      sleep: 40,
      stress: -5,
    },
  },
};

// === FİNANS SİSTEMİ ===
export const FINANCE = {
  // Başlangıç bakiyesi
  STARTING_BALANCE: 500,

  // Market fiyatları
  MARKET_PRICES: {
    bread:       5,
    eggs:        8,
    cheese:      12,
    chicken:     18,
    vegetables:  10,
    fruit:       7,
    milk:        6,
    rice:        9,
    water:       3,
    energy_drink: 15,
  },

  // Online market çarpanı (fiziksel marketten daha pahalı)
  ONLINE_MARKET_MARKUP: 1.3,

  // Konut kira tablosu
  HOUSING: {
    starter_apartment:  { rent: 800,  recoveryMultiplier: 1.0 },
    mid_apartment:      { rent: 1500, recoveryMultiplier: 1.15 },
    nice_apartment:     { rent: 2500, recoveryMultiplier: 1.30 },
    luxury_apartment:   { rent: 4000, recoveryMultiplier: 1.50 },
  },
};

// === MEKAN ETKİLERİ ===
export const LOCATIONS = {
  park: {
    stress: -15,
    health: 5,
    money: 0,
  },
  pub: {
    stress: -30,
    health: -5,
    money: -40,
  },
  cinema: {
    stress: -20,
    health: 0,
    money: -25,
  },
  gallery: {
    stress: -18,
    health: 0,
    money: -15,
  },
};

// === MADDE KULLANIM ETKİLERİ ===
export const SUBSTANCES = {
  cigarette: {
    immediateStress: -10,       // Anlık stres azaltma
    healthPenalty: 0.5,         // Kümülatif sağlık hasarı (her kullanımda birikir)
    focusBonusDuration: 30,     // Odak bonusu süresi (dakika)
    focusBonusMultiplier: 1.1,  // Görev hız çarpanı
  },
  alcohol: {
    immediateStress: -20,
    healthPenalty: 1.0,
    focusBonusDuration: 0,
    focusBonusMultiplier: 1.0,
    hungerIncrease: 10,         // Alkol açtırır
  },
};

// === NPC İLİŞKİ SİSTEMİ ===
export const RELATIONSHIPS = {
  // İlişki seviyesi eşikleri
  STATUS_THRESHOLDS: {
    stranger:     0,
    acquaintance: 15,
    friend:       40,
    closeFriend:  65,
    bestFriend:   85,
  },

  // Günlük doğal azalma (etkileşim olmazsa)
  DAILY_DECAY: 0.5,

  // Partner ilişkisi eşiği
  PARTNER_MIN_LEVEL: 60,
};

// === KARİYER SİSTEMİ ===
export const CAREER = {
  // Rütbe geçiş eşikleri
  RANK_THRESHOLDS: {
    junior:       { minPoints: 0,    minMissions: 0 },
    junior_plus:  { minPoints: 0,    minMissions: 3 },
    mid:          { minPoints: 500,  minMissions: 10 },
    mid_senior:   { minPoints: 1500, minMissions: 20 },
    senior:       { minPoints: 3000, minMissions: 30 },
    lead:         { minPoints: 5000, minMissions: 45 },
  },
};

export default {
  TIME,
  BARS,
  FINANCE,
  LOCATIONS,
  SUBSTANCES,
  RELATIONSHIPS,
  CAREER,
};
