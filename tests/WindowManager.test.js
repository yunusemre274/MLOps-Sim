/**
 * WindowManager.test.js — Pencere Yöneticisi Birim Testleri (Aşama 2)
 *
 * Test edilen senaryolar:
 * 1. Pencere açma → openWindows listesine eklenme ve activeWindowId güncellemesi.
 * 2. Single-instance uygulama (explorer) 2. kez açılınca kopyasının oluşmaması, var olanın odaklanması.
 * 3. Multi-instance uygulama (terminal) 2. kez açılınca 2 ayrı pencere oluşması.
 * 4. Küçültme (minimize) → isMinimized: true, openWindows listesinde kalması.
 * 5. Ekranı Kaplama (maximize toggle) → isMaximized toggle davranışı.
 * 6. Kapatma (close) → openWindows listesinden tamamen silinmesi.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { windowManager } from '../src/engine/WindowManager';

describe('WindowManager Engine Birim Testleri', () => {
  beforeEach(() => {
    windowManager.reset();
  });

  it('Pencere açıldığında openWindows listesinde görünmeli ve aktif olmalı', () => {
    const id = windowManager.openApp('terminal');
    const state = windowManager.getState();

    expect(state.openWindows.length).toBe(1);
    expect(state.openWindows[0].id).toBe(id);
    expect(state.activeWindowId).toBe(id);
  });

  it('Single-instance uygulama 2 kez açılırsa aynı pencere odaklanmalı, yeni pencere açılmamalı', () => {
    const id1 = windowManager.openApp('explorer');
    const id2 = windowManager.openApp('explorer');

    const state = windowManager.getState();
    expect(state.openWindows.length).toBe(1);
    expect(id1).toBe(id2);
  });

  it('Multi-instance uygulama (terminal) 2 kez açılırsa 2 ayrı pencere oluşturulmalı', () => {
    const id1 = windowManager.openApp('terminal');
    const id2 = windowManager.openApp('terminal');

    const state = windowManager.getState();
    expect(state.openWindows.length).toBe(2);
    expect(id1).not.toBe(id2);
  });

  it('Küçültme (minimize) isMinimized: true yapmalı ama listeden silmemeli', () => {
    const id = windowManager.openApp('editor');
    windowManager.minimizeWindow(id);

    const state = windowManager.getState();
    expect(state.openWindows.length).toBe(1);
    expect(state.openWindows[0].isMinimized).toBe(true);
  });

  it('Ekranı kaplama (maximize) toggle davranışı sergilemeli', () => {
    const id = windowManager.openApp('monitoring');

    windowManager.maximizeWindow(id);
    expect(windowManager.getState().openWindows[0].isMaximized).toBe(true);

    windowManager.maximizeWindow(id);
    expect(windowManager.getState().openWindows[0].isMaximized).toBe(false);
  });

  it('Kapatma (close) pencereyi listeden tamamen silmeli', () => {
    const id = windowManager.openApp('tutorials');
    windowManager.closeWindow(id);

    const state = windowManager.getState();
    expect(state.openWindows.length).toBe(0);
    expect(state.activeWindowId).toBe(null);
  });
});
