/**
 * Round5Verification.test.js — Round 5 Zorunlu 6 Adımlık Doğrulama Testi
 *
 * 1. cd desktop, ls → klasörler / ile, uygulamalar [app] etiketiyle ve cyan (turkuaz) renkle.
 * 2. cd "Dosya Gezgini" → "Bu bir uygulama kısayolu, dizin değil. Açmak için: open..." hatası.
 * 3. open "Dosya Gezgini" → WindowManager üzerinden Dosya Gezgini penceresi açılır.
 * 4. open Terminal → WindowManager üzerinden yeni Terminal penceresi açılır.
 * 5. open projects / open test.txt → Dosya Gezgini / Kod Editörü açılır.
 * 6. open OlmayanUygulama → "Böyle bir dosya veya dizin yok" hatası verilir.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { globalVFS } from '../src/engine/VirtualFileSystem';
import { windowManager } from '../src/engine/WindowManager';
import { executeCommand } from '../src/engine/CommandRouter';

describe('Round 5 — Zorunlu 6 Adımlık Doğrulama Senaryosu', () => {
  const gitState = { initialized: false, staged: [], commits: [], branch: 'main' };

  beforeEach(() => {
    windowManager.reset();
    globalVFS.cd('/home/user');
  });

  it('Adım 1: cd desktop, ls → klasörler / ile, uygulamalar [app] etiketi ve turkuaz renkle listelenmeli', () => {
    globalVFS.cd('/home/user/desktop');
    const res = executeCommand('ls', globalVFS, gitState);

    expect(res).toContain('\x1b[36m[app] Terminal\x1b[0m');
    expect(res).toContain('\x1b[36m[app] Dosya Gezgini\x1b[0m');
    expect(res).toContain('\x1b[36m[app] Kod Editörü\x1b[0m');
  });

  it('Adım 2: cd "Dosya Gezgini" → yeni açıklayıcı hata mesajı dönmeli ve open önerisi içermeli', () => {
    globalVFS.cd('/home/user/desktop');
    const res = executeCommand('cd "Dosya Gezgini"', globalVFS, gitState);

    expect(res[0]).toBe('cd: Dosya Gezgini: Bu bir uygulama kısayolu, dizin değil. Açmak için: open "Dosya Gezgini".');
  });

  it('Adım 3: open "Dosya Gezgini" → WindowManager üzerinde Dosya Gezgini penceresini açmalı', () => {
    globalVFS.cd('/home/user/desktop');
    executeCommand('open "Dosya Gezgini"', globalVFS, gitState);

    const openWins = windowManager.getState().openWindows;
    expect(openWins.length).toBe(1);
    expect(openWins[0].appId).toBe('explorer');
  });

  it('Adım 4: open Terminal → WindowManager üzerinde yeni Terminal penceresi açmalı', () => {
    globalVFS.cd('/home/user/desktop');
    executeCommand('open Terminal', globalVFS, gitState);

    const openWins = windowManager.getState().openWindows;
    expect(openWins.length).toBe(1);
    expect(openWins[0].appId).toBe('terminal');
  });

  it('Adım 5: open projects & open test.txt → Dosya Gezgini ve Kod Editörü açılmalı', () => {
    globalVFS.cd('/home/user/desktop');
    globalVFS.mkdir('/home/user/desktop/projects');
    globalVFS.touch('/home/user/desktop/script.py');

    // open projects -> explorer açılır
    executeCommand('open projects', globalVFS, gitState);
    let openWins = windowManager.getState().openWindows;
    expect(openWins.some((w) => w.appId === 'explorer')).toBe(true);

    // open script.py -> editor açılır
    executeCommand('open script.py', globalVFS, gitState);
    openWins = windowManager.getState().openWindows;
    expect(openWins.some((w) => w.appId === 'editor')).toBe(true);
  });

  it('Adım 6: open olmayan-bir-isim → Böyle bir dosya veya dizin yok hatası dönmeli', () => {
    globalVFS.cd('/home/user/desktop');
    const res = executeCommand('open olmayan-bir-isim', globalVFS, gitState);

    expect(res[0]).toBe('open: olmayan-bir-isim: Böyle bir dosya veya dizin yok.');
  });
});
