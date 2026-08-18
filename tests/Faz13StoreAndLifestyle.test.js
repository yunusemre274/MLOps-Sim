import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../src/store/useGameStore';
import { STORE } from '../src/config/gameBalance.config.js';
import { calculateBarDecay } from '../src/engine/BarEngine';
import { calculateEncounterChance } from '../src/engine/EventEngine';

describe('Faz 13: Store and Lifestyle System', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('has 4 store categories with valid items', () => {
    expect(STORE.CATEGORIES.length).toBe(4);
    expect(STORE.CATEGORIES.map((c) => c.id)).toEqual(['clothing', 'cosmetics', 'home', 'art']);

    for (const cat of STORE.CATEGORIES) {
      const items = STORE.ITEMS[cat.id];
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.id).toBeDefined();
        expect(item.price).toBeGreaterThan(0);
        expect(item.lifestyleBonus).toBeGreaterThan(0);
      }
    }
  });

  it('purchases store item, spends balance, increases lifestyle bar, and updates wardrobe if clothing', () => {
    const store = useGameStore.getState();
    store.addMoney(1000); // balance = 1500

    const initialLifestyle = useGameStore.getState().bars.lifestyle.current;
    const techHoodie = STORE.ITEMS.clothing.find((i) => i.id === 'hoodie_tech');

    const result = useGameStore.getState().buyStoreItem(techHoodie);
    expect(result.success).toBe(true);

    const state = useGameStore.getState();
    expect(state.finance.balance).toBe(1500 - techHoodie.price);
    expect(state.bars.lifestyle.current).toBe(initialLifestyle + techHoodie.lifestyleBonus);
    expect(state.inventory.items).toContain(techHoodie.id);
    expect(state.inventory.wardrobe).toContain(techHoodie.id);
  });

  it('fails to purchase store item when balance is insufficient', () => {
    useGameStore.setState((s) => ({
      finance: { ...s.finance, balance: 50 },
    }));

    const expensiveArt = STORE.ITEMS.art.find((i) => i.id === 'cyberpunk_art'); // 750
    const result = useGameStore.getState().buyStoreItem(expensiveArt);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Yetersiz bakiye');
    expect(useGameStore.getState().finance.balance).toBe(50);
  });

  it('decays lifestyle bar gradually over game time in calculateBarDecay', () => {
    const initialBars = {
      sleep: { current: 100, max: 100 },
      hunger: { current: 100, max: 100 },
      health: { current: 100, max: 100 },
      stress: { current: 0, max: 100 },
      lifestyle: { current: 80, max: 100 },
    };

    const decayed = calculateBarDecay(initialBars, 60); // 60 minutes
    expect(decayed.lifestyle.current).toBeLessThan(80);
    expect(decayed.lifestyle.current).toBeGreaterThanOrEqual(0);
  });

  it('lifestyle modifies NPC encounter chance by +20% when >= 70 and -15% when <= 30', () => {
    const dummyNpc = { id: 'npc_1', personality: 'friendly', locations: ['park'] };
    const dummyRel = { level: 20, lastInteraction: null };

    const chanceNeutral = calculateEncounterChance(dummyNpc, dummyRel, 5, 50);
    const chanceHighLifestyle = calculateEncounterChance(dummyNpc, dummyRel, 5, 80);
    const chanceLowLifestyle = calculateEncounterChance(dummyNpc, dummyRel, 5, 20);

    expect(chanceHighLifestyle).toBeCloseTo(chanceNeutral * 1.20, 5);
    expect(chanceLowLifestyle).toBeCloseTo(chanceNeutral * 0.85, 5);
  });
});
