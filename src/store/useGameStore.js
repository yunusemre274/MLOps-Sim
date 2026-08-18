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
    sleep:     { current: 100, max: 100 },
    hunger:    { current: 100, max: 100 },
    health:    { current: 100, max: 100 },
    stress:    { current: 0,   max: 100 },
    lifestyle: { current: 50,  max: 100 },
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
    transactions: [
      { id: 'tx_init', title: 'Başlangıç Bakiyesi', amount: 500, type: 'income', category: 'transfer', time: '08:00', day: 1 },
    ],
  },

  // Telefon Ayarları & Ekosistemi
  phoneSettings: {
    brightness: 100, // 20 - 100 arası (gerçek koyuluk overlay'i)
    wifi: true,
    bluetooth: true,
    airplaneMode: false,
    volume: 80,
    flashlight: false,
  },

  // Merkezi Bildirim Sistemi
  notifications: [
    {
      id: 'notif_welcome',
      app: 'jobs',
      title: 'DevJobs Kariyer',
      body: 'Hoş geldiniz! Yeni MLOps iş ilanları listelendi.',
      time: '08:00',
      day: 1,
      read: false,
      icon: '💼',
      onTapApp: 'jobs',
    },
  ],

  // Mesajlar (SMS) — Sistem Bildirimleri
  smsMessages: [
    { id: 'sms_1', from: 'DevBank', text: 'Hesabınıza ₺500 başlangıç bakiyesi aktarıldı. İyi çalışmalar!', time: '08:00', day: 1, category: 'bank' },
  ],

  // Gmail E-postaları
  emails: [
    {
      id: 'email_welcome',
      sender: 'TechStart Co. HR <hr@techstart.co>',
      subject: 'MLOps Simülasyon Platformuna Hoş Geldiniz!',
      preview: 'Kariyerinizde başarılar dileriz. İş Platformu üzerinden açık pozisyonları inceleyebilirsiniz...',
      body: 'Merhaba,\n\nMLOps platformuna hoş geldiniz! Docker, Compose ve CI/CD becerilerinizi sergileyeceğiniz görevler sizi bekliyor.\n\nİyi çalışmalar,\nTechStart İK Ekibi',
      time: '08:00',
      day: 1,
      read: false,
      starred: false,
    },
  ],

  // Hava Durumu (Simüle & Gün bazlı)
  weather: {
    temp: 24,
    condition: 'sunny',
    label: 'Güneşli',
    icon: '☀️',
    high: 27,
    low: 18,
    city: 'Neo-İstanbul',
  },

  // NPC ilişkileri — NPC verisiyle eşleşecek
  relationships: {
    ayse: { level: 25, status: 'acquaintance', isPartner: false, flags: {}, lastInteraction: null },
    mehmet: { level: 30, status: 'friend', isPartner: false, flags: {}, lastInteraction: null },
    zeynep: { level: 15, status: 'acquaintance', isPartner: false, flags: {}, lastInteraction: null },
    burak: { level: 20, status: 'acquaintance', isPartner: false, flags: {}, lastInteraction: null },
  },

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

  // Envanter (buzdolabı stoku, gardırop, eşyalar)
  inventory: {
    fridge: [],
    wardrobe: ['casual_outfit_1'],
    items: [],
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

  // === Finansal işlemler & İşlem Geçmişi ===
  addTransaction: (tx) =>
    set((state) => ({
      finance: {
        ...state.finance,
        transactions: [
          {
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            time: state.currentTime,
            day: state.dayCount,
            ...tx,
          },
          ...(state.finance.transactions || []),
        ],
      },
    })),

  addMoney: (amount, title = 'Hesaba Giriş', category = 'transfer') =>
    set((state) => {
      const newBalance = state.finance.balance + amount;
      const newTx = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        amount,
        type: 'income',
        category,
        time: state.currentTime,
        day: state.dayCount,
      };
      return {
        finance: {
          ...state.finance,
          balance: newBalance,
          transactions: [newTx, ...(state.finance.transactions || [])],
        },
      };
    }),

  spendMoney: (amount, title = 'Harcama', category = 'expense') =>
    set((state) => {
      if (state.finance.balance < amount) {
        console.warn('[useGameStore] Yetersiz bakiye');
        return state;
      }
      const newBalance = state.finance.balance - amount;
      const newTx = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        amount,
        type: 'expense',
        category,
        time: state.currentTime,
        day: state.dayCount,
      };
      return {
        finance: {
          ...state.finance,
          balance: newBalance,
          transactions: [newTx, ...(state.finance.transactions || [])],
        },
      };
    }),

  // === Telefon Ekosistemi & Bildirimler (Faz 14) ===
  pushNotification: ({ app = 'system', title, body, icon = '🔔', onTapApp = null, onTapPayload = null }) =>
    set((state) => {
      const newNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        app,
        title,
        body,
        icon,
        time: state.currentTime,
        day: state.dayCount,
        read: false,
        onTapApp: onTapApp || app,
        onTapPayload,
      };
      return {
        notifications: [newNotif, ...(state.notifications || [])],
      };
    }),

  clearNotifications: () => set({ notifications: [] }),

  removeNotification: (notifId) =>
    set((state) => ({
      notifications: (state.notifications || []).filter((n) => n.id !== notifId),
    })),

  markNotificationRead: (notifId) =>
    set((state) => ({
      notifications: (state.notifications || []).map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      ),
    })),

  // === Telefon Ayarları ===
  setPhoneBrightness: (brightness) =>
    set((state) => ({
      phoneSettings: {
        ...state.phoneSettings,
        brightness: Math.max(20, Math.min(100, brightness)),
      },
    })),

  togglePhoneSetting: (key) =>
    set((state) => ({
      phoneSettings: {
        ...state.phoneSettings,
        [key]: !state.phoneSettings[key],
      },
    })),

  // === SMS & E-Posta Gönderimi ===
  sendSms: ({ from = 'Sistem', text, category = 'system' }) =>
    set((state) => ({
      smsMessages: [
        {
          id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          from,
          text,
          time: state.currentTime,
          day: state.dayCount,
          category,
        },
        ...(state.smsMessages || []),
      ],
    })),

  sendEmail: ({ sender, subject, preview, body }) =>
    set((state) => ({
      emails: [
        {
          id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          sender,
          subject,
          preview: preview || body.slice(0, 50) + '...',
          body,
          time: state.currentTime,
          day: state.dayCount,
          read: false,
          starred: false,
        },
        ...(state.emails || []),
      ],
    })),

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
      const missionObj = missions.find((m) => m.id === missionId);
      const missionTitle = missionObj ? missionObj.title : missionId;

      // SMS bildirimi oluştur
      const newSms = {
        id: `sms_${Date.now()}`,
        from: 'DevJobs',
        text: `"${missionTitle}" görevi kabul edildi. Terminalden git clone ile başlayabilirsiniz.`,
        time: state.currentTime,
        day: state.dayCount,
        category: 'jobs',
      };

      // Bildirim merkezine ekle
      const newNotif = {
        id: `notif_${Date.now()}`,
        app: 'jobs',
        title: 'DevJobs Görev Alındı',
        body: `"${missionTitle}" projesi aktif görevlerinize eklendi.`,
        time: state.currentTime,
        day: state.dayCount,
        read: false,
        icon: '💼',
        onTapApp: 'jobs',
      };

      return {
        career: {
          ...state.career,
          activeMissions: [...state.career.activeMissions, missionId],
        },
        smsMessages: [newSms, ...(state.smsMessages || [])],
        notifications: [newNotif, ...(state.notifications || [])],
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
      const missionObj = missions.find((m) => m.id === missionId);
      const missionTitle = missionObj ? missionObj.title : missionId;

      const newTx = {
        id: `tx_${Date.now()}`,
        title: `Görev Ödülü: ${missionTitle}`,
        amount: moneyReward,
        type: 'income',
        category: 'mission',
        time: state.currentTime,
        day: state.dayCount,
      };

      const newSms = {
        id: `sms_${Date.now()}`,
        from: 'DevBank',
        text: `Hesabınıza "${missionTitle}" teslimatı için ₺${moneyReward} yatırıldı.`,
        time: state.currentTime,
        day: state.dayCount,
        category: 'bank',
      };

      const newNotif = {
        id: `notif_${Date.now()}`,
        app: 'jobs',
        title: '🎉 Görev Teslim Edildi!',
        body: `"${missionTitle}" teslim edildi. +₺${moneyReward}, +${careerReward} KP.`,
        time: state.currentTime,
        day: state.dayCount,
        read: false,
        icon: '💰',
        onTapApp: 'bank',
      };

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
          transactions: [newTx, ...(state.finance.transactions || [])],
        },
        smsMessages: [newSms, ...(state.smsMessages || [])],
        notifications: [newNotif, ...(state.notifications || [])],
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

  // === Mağaza Satın Alma (Faz 13) ===
  buyStoreItem: (item) => {
    const state = useGameStore.getState();
    if (state.finance.balance < item.price) {
      return { success: false, message: `Yetersiz bakiye! ₺${item.price} gerekli, mevcut: ₺${state.finance.balance}` };
    }

    const currentLifestyle = state.bars.lifestyle ? state.bars.lifestyle.current : 50;
    const maxLifestyle = state.bars.lifestyle ? state.bars.lifestyle.max : 100;
    const newLifestyle = Math.min(maxLifestyle, Math.round((currentLifestyle + (item.lifestyleBonus || 5)) * 10) / 10);

    const newItems = [...(state.inventory.items || []), item.id];
    const newWardrobe = item.category === 'clothing' && !state.inventory.wardrobe.includes(item.id)
      ? [...state.inventory.wardrobe, item.id]
      : state.inventory.wardrobe;

    useGameStore.setState((s) => ({
      finance: {
        ...s.finance,
        balance: s.finance.balance - item.price,
      },
      bars: {
        ...s.bars,
        lifestyle: {
          ...(s.bars.lifestyle || { max: 100 }),
          current: newLifestyle,
        },
      },
      inventory: {
        ...s.inventory,
        items: newItems,
        wardrobe: newWardrobe,
      },
    }));

    state.addEvent(`Mağazadan satın alındı: ${item.name} (-₺${item.price}, +${item.lifestyleBonus} Yaşam Tarzı)`);
    return { success: true, message: `${item.name} başarıyla satın alındı!` };
  },

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
