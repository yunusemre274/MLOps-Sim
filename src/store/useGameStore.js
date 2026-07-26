/**
 * useGameStore.js — Merkezi oyun durumu (GameState)
 *
 * Neden tek store: Oyunun tüm durumu (barlar, para, kariyer, NPC ilişkileri,
 * envanter, zaman) tek merkezden yönetilir. Bu, state tutarlılığını garanti eder
 * ve debugging/playtesting'i kolaylaştırır.
 *
 * Sabitler burada tanımlanmaz — tüm denge değerleri gameBalance.config.js'te tutulur.
 */

import { create } from 'zustand';

// --- İlk durum (initial state) ---
const initialState = {
  // Oyun meta bilgileri
  version: '0.1.0',
  dayCount: 1,
  currentTime: '08:00',
  currentScene: 'home',
  isPaused: false,

  // Karakter bilgileri
  character: {
    name: 'Oyuncu',
    rank: 'junior',
    careerPoints: 0,
    totalCompletedMissions: 0,
  },

  // Bar sistemi — decay rate'ler gameBalance.config.js'te tanımlanacak
  bars: {
    sleep:   { current: 100, max: 100 },
    hunger:  { current: 100, max: 100 },
    health:  { current: 100, max: 100 },
    stress:  { current: 0,   max: 100 },
  },

  // Finansal durum
  finance: {
    balance: 500,
    monthlyPassiveIncome: 0,
    monthlyExpenses: {
      rent: 800,
      serverCosts: 0,
      employeeSalaries: 0,
    },
    incomeHistory: [],
  },

  // NPC ilişkileri — NPC verisiyle eşleşecek
  relationships: {},

  // Kariyer durumu
  career: {
    currentEmployer: null,
    activeMissions: [],
    completedMissions: [],
    ownCompany: null,
    employees: [],
  },

  // Envanter (buzdolabı stoku)
  inventory: {
    fridge: [],
    wardrobe: ['casual_outfit_1'],
  },

  // Konut bilgileri
  housing: {
    currentHome: 'starter_apartment',
    barRecoveryMultiplier: 1.0,
    monthlyRent: 800,
  },

  // Madde kullanım takibi
  substanceUse: {
    cigaretteUseCount: 0,
    alcoholUseCount: 0,
    healthPenaltyAccumulated: 0,
    focusBonusActive: false,
    focusBonusExpiresAt: null,
  },

  // Teknik borç (Lead seviyesi için)
  technicalDebt: {
    totalDebt: 0,
    incidentRiskMultiplier: 1.0,
  },

  // Günlük olaylar
  todayEvents: [],
};

// --- Store tanımı ---
const useGameStore = create((set, get) => ({
  ...initialState,

  // === Sahne yönetimi ===
  setScene: (sceneName) => set({ currentScene: sceneName }),

  // === Bar mutasyonları ===
  updateBar: (barName, delta) =>
    set((state) => {
      const bar = state.bars[barName];
      if (!bar) {
        console.warn(`[useGameStore] Bilinmeyen bar: ${barName}`);
        return state;
      }
      const newValue = Math.max(0, Math.min(bar.max, bar.current + delta));
      return {
        bars: {
          ...state.bars,
          [barName]: { ...bar, current: newValue },
        },
      };
    }),

  setBar: (barName, value) =>
    set((state) => {
      const bar = state.bars[barName];
      if (!bar) return state;
      return {
        bars: {
          ...state.bars,
          [barName]: { ...bar, current: Math.max(0, Math.min(bar.max, value)) },
        },
      };
    }),

  // === Zaman yönetimi ===
  setTime: (time) => set({ currentTime: time }),
  advanceDay: () =>
    set((state) => ({
      dayCount: state.dayCount + 1,
      currentTime: '08:00',
      todayEvents: [],
    })),

  // === Finansal işlemler ===
  addMoney: (amount) =>
    set((state) => ({
      finance: {
        ...state.finance,
        balance: state.finance.balance + amount,
      },
    })),

  spendMoney: (amount) =>
    set((state) => {
      if (state.finance.balance < amount) {
        console.warn('[useGameStore] Yetersiz bakiye');
        return state;
      }
      return {
        finance: {
          ...state.finance,
          balance: state.finance.balance - amount,
        },
      };
    }),

  // === NPC ilişki yönetimi ===
  updateRelationship: (npcId, delta) =>
    set((state) => {
      const current = state.relationships[npcId] || {
        level: 0,
        status: 'stranger',
        isPartner: false,
        flags: {},
        lastInteraction: null,
      };
      const newLevel = Math.max(0, Math.min(100, current.level + delta));
      return {
        relationships: {
          ...state.relationships,
          [npcId]: { ...current, level: newLevel },
        },
      };
    }),

  // === Kariyer işlemleri ===
  addCareerPoints: (points) =>
    set((state) => ({
      character: {
        ...state.character,
        careerPoints: state.character.careerPoints + points,
      },
    })),

  setRank: (rank) =>
    set((state) => ({
      character: { ...state.character, rank },
    })),

  // === Envanter ===
  addToFridge: (item) =>
    set((state) => ({
      inventory: {
        ...state.inventory,
        fridge: [...state.inventory.fridge, item],
      },
    })),

  removeFromFridge: (index) =>
    set((state) => ({
      inventory: {
        ...state.inventory,
        fridge: state.inventory.fridge.filter((_, i) => i !== index),
      },
    })),

  // === Olay takibi ===
  addEvent: (event) =>
    set((state) => ({
      todayEvents: [...state.todayEvents, event],
    })),

  // === Oyun pause/resume ===
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  // === Tam reset (yeni oyun) ===
  resetGame: () => set(initialState),
}));

export default useGameStore;
