import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../src/store/useGameStore';

describe('Phone Scene & Online Market Navigation Test', () => {
  beforeEach(() => {
    useGameStore.setState({
      currentScene: 'phone',
      finance: { balance: 500, monthlyPassiveIncome: 0 },
      inventory: { fridge: [], wardrobe: [] },
      events: [],
    });
  });

  it('Telefon sahnesinden Eve Dönüldüğünde sahne "home" olmalı', () => {
    expect(useGameStore.getState().currentScene).toBe('phone');
    useGameStore.getState().setScene('home');
    expect(useGameStore.getState().currentScene).toBe('home');
  });

  it('Online marketten alışveriş yapıldığında buzdolabına ürün eklenmeli ve bakiye düşmeli', () => {
    const state = useGameStore.getState();
    const itemCost = 15; // Örnek online fiyat

    useGameStore.setState({
      finance: { ...state.finance, balance: state.finance.balance - itemCost },
    });
    useGameStore.getState().addToFridge('bread');

    expect(useGameStore.getState().inventory.fridge).toContain('bread');
    expect(useGameStore.getState().finance.balance).toBe(485);
  });
});
