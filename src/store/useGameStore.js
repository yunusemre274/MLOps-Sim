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
import { globalVFS } from '../engine/VirtualFileSystem';
import missions from '../data/missions.json';

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

  // Partner ilişki sistemi
  partner: null, // { npcId, startDay, mood: 'happy'|'angry'|'broken_up' }

  // NPC mesajları (telefon)
  npcMessages: [], // [{ id, from, text, day, read }]

  // Kariyer durumu
  career: {
    currentEmployer: null,
    activeMissions: [],
    readyToDeliverMissions: [],
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
    set((state) => {
      const newDay = state.dayCount + 1;
      const updates = {
        dayCount: newDay,
        currentTime: '08:00',
        todayEvents: [],
      };

      // Her 30 günde bir aylık kira ödemesi + pasif gelir + şirket finansı
      if (newDay % 30 === 0) {
        const rent = state.housing.monthlyRent;
        const passiveIncome = state.finance.monthlyPassiveIncome;

        // Şirket gider/gelirleri
        const company = state.career.ownCompany;
        let companyExpense = 0;
        let companyIncome = 0;
        if (company) {
          companyExpense = company.employees.reduce((s, e) => s + e.salary, 0) + company.monthlyRent;
          companyIncome = company.clients.reduce((s, c) => s + c.baseIncome, 0);
        }

        const netChange = passiveIncome + companyIncome - rent - companyExpense;
        updates.finance = {
          ...state.finance,
          balance: state.finance.balance + netChange,
        };
        updates.todayEvents = [
          `💰 Aylık kira ödendi: ₺${rent}`,
          ...(passiveIncome > 0 ? [`💼 Bakım geliri: +₺${passiveIncome}`] : []),
          ...(companyIncome > 0 ? [`🏢 Müşteri geliri: +₺${companyIncome}`] : []),
          ...(companyExpense > 0 ? [`📋 Şirket giderleri: -₺${companyExpense}`] : []),
        ];

        // Şirket varsa müşteri çekme şansı (her ay)
        if (company && company.reputation > 0) {
          const chance = company.reputation / 200;
          if (Math.random() < chance) {
            const sectors = ['Fintech', 'Sağlık', 'Eğitim', 'Lojistik', 'Enerji', 'Oyun'];
            const names = ['AlphaInc', 'BetaCorp', 'Neosoft', 'GigaTech', 'VeriPlus', 'SmartOps'];
            const newClient = {
              id: `client_${newDay}`,
              name: names[Math.floor(Math.random() * names.length)],
              sector: sectors[Math.floor(Math.random() * sectors.length)],
              baseIncome: 100 + Math.floor(Math.random() * 300),
              satisfaction: 70 + Math.floor(Math.random() * 25),
              startDay: newDay,
            };
            updates.career = {
              ...state.career,
              ownCompany: {
                ...company,
                clients: [...company.clients, newClient],
              },
            };
            updates.todayEvents.push(`🤝 Yeni müşteri: ${newClient.name} (${newClient.sector})`);
          }
        }
      }

      return updates;
    }),

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
    set((state) => {
      const newPoints = state.character.careerPoints + points;
      const newRank = calculateRank(newPoints);
      return {
        character: {
          ...state.character,
          careerPoints: newPoints,
          rank: newRank,
        },
      };
    }),

  setRank: (rank) =>
    set((state) => ({
      character: { ...state.character, rank },
    })),

  // === Görev yönetimi ===
  acceptMission: (missionId) =>
    set((state) => {
      if (state.career.activeMissions.includes(missionId)) return state;
      return {
        career: {
          ...state.career,
          activeMissions: [...state.career.activeMissions, missionId],
        },
      };
    }),

  markMissionReadyToDeliver: (missionId) =>
    set((state) => {
      const ready = state.career.readyToDeliverMissions || [];
      if (ready.includes(missionId)) return state;
      return {
        career: {
          ...state.career,
          readyToDeliverMissions: [...ready, missionId],
        },
      };
    }),

  completeMission: (missionId, moneyReward, careerReward, monthlyMaintenance) =>
    set((state) => {
      const newPoints = state.character.careerPoints + careerReward;
      const newRank = calculateRank(newPoints);
      const readyList = state.career.readyToDeliverMissions || [];
      return {
        character: {
          ...state.character,
          careerPoints: newPoints,
          rank: newRank,
          totalCompletedMissions: state.character.totalCompletedMissions + 1,
        },
        career: {
          ...state.career,
          activeMissions: state.career.activeMissions.filter((id) => id !== missionId),
          readyToDeliverMissions: readyList.filter((id) => id !== missionId),
          completedMissions: [...state.career.completedMissions, missionId],
        },
        finance: {
          ...state.finance,
          balance: state.finance.balance + moneyReward,
          monthlyPassiveIncome: state.finance.monthlyPassiveIncome + (monthlyMaintenance || 0),
        },
      };
    }),

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

  // === Partner ilişki sistemi ===
  setPartner: (npcId) =>
    set((state) => ({
      partner: { npcId, startDay: state.dayCount, mood: 'happy' },
    })),

  breakUp: () =>
    set(() => ({
      partner: null,
    })),

  setPartnerMood: (mood) =>
    set((state) => ({
      partner: state.partner ? { ...state.partner, mood } : null,
    })),

  // === NPC mesajlaşma (telefon) ===
  addNpcMessage: (from, text) =>
    set((state) => ({
      npcMessages: [
        ...state.npcMessages,
        { id: `msg_${Date.now()}`, from, text, day: state.dayCount, read: false },
      ],
    })),

  markMessageRead: (msgId) =>
    set((state) => ({
      npcMessages: state.npcMessages.map((m) =>
        m.id === msgId ? { ...m, read: true } : m
      ),
    })),

  // === Oyun pause/resume ===
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  // === Tam reset (yeni oyun) ===
  resetGame: () => set(initialState),
}));

/**
 * Kariyer puanına göre rütbe hesapla.
 * Eşikler gameBalance.config.js'e taşınabilir.
 */
const RANK_THRESHOLDS = [
  { rank: 'lead',       minPoints: 2000 },
  { rank: 'senior',     minPoints: 1200 },
  { rank: 'mid_senior', minPoints: 700 },
  { rank: 'mid',        minPoints: 400 },
  { rank: 'junior_plus', minPoints: 150 },
  { rank: 'junior',     minPoints: 0 },
];

function calculateRank(careerPoints) {
  for (const tier of RANK_THRESHOLDS) {
    if (careerPoints >= tier.minPoints) return tier.rank;
  }
  return 'junior';
}

export default useGameStore;
