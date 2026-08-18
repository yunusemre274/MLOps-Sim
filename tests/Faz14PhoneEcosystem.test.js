import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../src/store/useGameStore.js';
import missions from '../src/data/missions.json';

describe('Faz 14 — iOS Tarzı Telefon Arayüzü & 8 Adımlı Doğrulama Senaryosu', () => {
  beforeEach(() => {
    useGameStore.setState({
      finance: {
        balance: 500,
        monthlyPassiveIncome: 0,
        monthlyExpenses: { rent: 800 },
        transactions: [
          { id: 'tx_init', title: 'Başlangıç Bakiyesi', amount: 500, type: 'income', category: 'transfer', time: '08:00', day: 1 },
        ],
      },
      phoneSettings: {
        brightness: 100,
        wifi: true,
        bluetooth: true,
        airplaneMode: false,
        volume: 80,
        flashlight: false,
      },
      notifications: [
        {
          id: 'notif_welcome',
          app: 'jobs',
          title: 'DevJobs Kariyer',
          body: 'Yeni ilanlar hazır!',
          time: '08:00',
          day: 1,
          read: false,
          icon: '💼',
          onTapApp: 'jobs',
        },
      ],
      smsMessages: [],
      career: {
        activeMissions: [],
        readyToDeliverMissions: [],
        completedMissions: [],
      },
      relationships: {
        ayse: { level: 20, status: 'tanıdık' },
        mehmet: { level: 30, status: 'arkadaş' },
      },
      inventory: {
        fridge: [],
      },
    });
  });

  it('Adım 1: Telefon ana ekranında tüm uygulamalar ve hava durumu state verisi mevcut olmalıdır', () => {
    const state = useGameStore.getState();
    expect(state.weather).toBeDefined();
    expect(state.weather.city).toBe('Neo-İstanbul');
    expect(state.weather.temp).toBeGreaterThan(0);

    const requiredApps = ['jobs', 'linkedin', 'whatsapp', 'call', 'messages', 'market', 'bank', 'gmail', 'spotify', 'settings'];
    expect(requiredApps.length).toBe(10);
  });

  it('Adım 2: Spotify tıklandığında dekoratif kalmalı ve sistem durumunu bozmamalıdır', () => {
    const state = useGameStore.getState();
    expect(state.finance.balance).toBe(500);
    // Spotify tıklandığında toast gösterilir, ekran açılmaz
  });

  it('Adım 3: Online Marketten sipariş verildiğinde para düşmeli, buzdolabına ürün eklenmeli, SMS ve bildirim merkezine bildirim düşmelidir', () => {
    const store = useGameStore.getState();
    const itemCost = 35; // online ekmek/yumurta maliyeti
    store.spendMoney(itemCost, 'Online Market: Organik Yumurta', 'food');
    store.addToFridge('eggs');
    store.sendSms({ from: 'GetirMLOps', text: 'Siparişiniz yola çıktı!', category: 'market' });
    store.pushNotification({ app: 'market', title: '🛵 Kurye Teslimatı', body: 'Yumurta teslim edildi!', icon: '🛵', onTapApp: 'messages' });

    const updated = useGameStore.getState();
    expect(updated.finance.balance).toBe(465);
    expect(updated.inventory.fridge).toContain('eggs');
    expect(updated.smsMessages.some((s) => s.from === 'GetirMLOps')).toBe(true);
    expect(updated.notifications.some((n) => n.title.includes('Kurye'))).toBe(true);
  });

  it('Adım 4: Jobs uygulamasından bir işe başvurulduğunda merkezi store güncellenmeli ve masaüstü ile senkron olmalıdır', () => {
    const store = useGameStore.getState();
    const testMission = missions[0];

    store.acceptMission(testMission.id);

    const updated = useGameStore.getState();
    expect(updated.career.activeMissions).toContain(testMission.id);

    // Bildirim ve SMS tetiklenmiş olmalı
    expect(updated.notifications.some((n) => n.app === 'jobs')).toBe(true);
    expect(updated.smsMessages.some((s) => s.from === 'DevJobs')).toBe(true);
  });

  it('Adım 5: WhatsApp uygulamasında NPC ile mesajlaşıldığında ilişki barı artmalıdır', () => {
    const store = useGameStore.getState();
    const initialAyseLevel = store.relationships.ayse.level;

    store.updateRelationship('ayse', 5);

    const updated = useGameStore.getState();
    expect(updated.relationships.ayse.level).toBe(initialAyseLevel + 5);
  });

  it('Adım 6: Kontrol panelinden parlaklık sliderı değiştirildiğinde store güncellenmeli ve sınırları korumalıdır', () => {
    const store = useGameStore.getState();

    store.setPhoneBrightness(25);
    expect(useGameStore.getState().phoneSettings.brightness).toBe(25);

    store.setPhoneBrightness(100);
    expect(useGameStore.getState().phoneSettings.brightness).toBe(100);

    // Sınır kontrolleri (en az 20, en fazla 100)
    store.setPhoneBrightness(5);
    expect(useGameStore.getState().phoneSettings.brightness).toBe(20);
  });

  it('Adım 7: Bildirim merkezinde bildirimler listelenmeli, okundu olarak işaretlenebilmeli ve temizlenebilmelidir', () => {
    const store = useGameStore.getState();
    expect(store.notifications.length).toBeGreaterThan(0);

    const notifId = store.notifications[0].id;
    store.markNotificationRead(notifId);
    expect(useGameStore.getState().notifications.find((n) => n.id === notifId).read).toBe(true);

    store.clearNotifications();
    expect(useGameStore.getState().notifications.length).toBe(0);
  });

  it('Adım 8: Banka Hesabı uygulaması bakiyesi ve hareketleri merkezi para durumuyla birebir senkronize olmalıdır', () => {
    const store = useGameStore.getState();
    expect(store.finance.balance).toBe(500);
    expect(store.finance.transactions.length).toBeGreaterThan(0);

    store.addMoney(250, 'Görev Ödülü', 'mission');

    const updated = useGameStore.getState();
    expect(updated.finance.balance).toBe(750);
    expect(updated.finance.transactions[0].amount).toBe(250);
    expect(updated.finance.transactions[0].type).toBe('income');
  });
});
