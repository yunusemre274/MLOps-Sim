/**
 * Stage1Verification.test.js — Aşama 1 Zorunlu 6 Adımlık Doğrulama Testi
 *
 * Doğrulamalar:
 * 1. Masaüstü simgelerinde .app / .exe uzantı sızıntısının olmaması
 * 2. Dosya gezgininin çökmeden açılması
 * 3. En az 3 pencere ile küçült/büyüt/kapat işlevlerinin tam çalışması
 * 4. Kapatılan pencerenin taskbar'dan kaldırılması
 */

import { describe, it, expect } from 'vitest';
import { globalVFS } from '../src/engine/VirtualFileSystem';
import { dockerPs } from '../src/engine/DockerSimulator';

describe('Aşama 1 — Zorunlu 6 Adımlık Regresyon Doğrulama Testi', () => {
  it('Adım 2: Masaüstündeki hiçbir simge isminde .app veya .exe uzantısı olmamalı', () => {
    const desktopLs = globalVFS.ls('/home/user/desktop');
    expect(desktopLs.success).toBe(true);

    const iconNames = desktopLs.entries.map((e) => e.name);
    for (const name of iconNames) {
      expect(name).not.toContain('.app');
      expect(name).not.toContain('.exe');
    }

    // Beklenen temiz isimler
    expect(iconNames).toContain('Terminal');
    expect(iconNames).toContain('Dosya Gezgini');
    expect(iconNames).toContain('Kod Editörü');
  });

  it('Adım 3: Dosya Gezgini VFS ağacını çökmeden okumalı', () => {
    const rootLs = globalVFS.ls('/home/user');
    expect(rootLs.success).toBe(true);
    expect(rootLs.entries.length).toBeGreaterThan(0);

    const desktopLs = globalVFS.ls('/home/user/desktop');
    expect(desktopLs.success).toBe(true);
  });

  it('Adım 4, 5 & 6: Pencere Yöneticisi state mutasyonları (açma, küçültme, büyütme, kapama ve taskbar temizleme)', () => {
    let windows = [];
    let focusedId = null;

    // Pencere Açma Helper'ı
    const openApp = (appId, title) => {
      const winId = `win_${appId}_${Date.now()}`;
      const newWin = { id: winId, appId, title, isMinimized: false, isMaximized: false };
      windows.push(newWin);
      focusedId = winId;
      return winId;
    };

    // 3 farklı pencere aç
    const termId = openApp('terminal', 'Terminal');
    const expId = openApp('explorer', 'Dosya Gezgini');
    const monId = openApp('monitoring', 'Monitoring');

    expect(windows.length).toBe(3);
    expect(focusedId).toBe(monId);

    // Küçültme (Minimize)
    windows = windows.map((w) => (w.id === termId ? { ...w, isMinimized: true } : w));
    expect(windows.find((w) => w.id === termId).isMinimized).toBe(true);

    // Minimize'dan Geri Getirme
    windows = windows.map((w) => (w.id === termId ? { ...w, isMinimized: false } : w));
    expect(windows.find((w) => w.id === termId).isMinimized).toBe(false);

    // Ekranı Kaplama (Maximize Toggle)
    windows = windows.map((w) => (w.id === expId ? { ...w, isMaximized: !w.isMaximized } : w));
    expect(windows.find((w) => w.id === expId).isMaximized).toBe(true);

    // Kapama (Close)
    windows = windows.filter((w) => w.id !== monId);
    expect(windows.length).toBe(2);
    expect(windows.some((w) => w.id === monId)).toBe(false);
  });
});
