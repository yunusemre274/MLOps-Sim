/**
 * VFSReactivityVerification.test.js — Zorunlu 10 Adımlık VFS Reaktivite ve Eşleşme Doğrulama Testi
 *
 * Faz 13/17 Round 3:
 * Terminal, Masaüstü ve Dosya Gezgini'nin aynı VFS düğümünü okuduğunu,
 * touch/rm komutlarının anında ve reaktif olarak senkronize olduğunu doğrular.
 */

import { describe, it, expect } from 'vitest';
import { globalVFS } from '../src/engine/VirtualFileSystem';
import { executeCommand } from '../src/engine/CommandRouter';

describe('Zorunlu 10 Adımlık VFS Reaktivite Senaryosu', () => {
  it('10 adımlık terminal / masaüstü / dosya gezgini senkronizasyon senaryosunu başarıyla tamamlamalı', () => {
    const gitState = { initialized: false, staged: [], commits: [], branch: 'main' };

    // Adım 1 & 2: pwd → /home/user
    const pwd1 = executeCommand('pwd', globalVFS, gitState);
    expect(pwd1[0]).toBe('/home/user');

    // Adım 3: ls → desktop ve projects görünmeli
    const ls1 = executeCommand('ls', globalVFS, gitState);
    expect(ls1.some((e) => e.includes('projects'))).toBe(true);
    expect(ls1.some((e) => e.includes('desktop'))).toBe(true);

    // Adım 4: cd desktop → /home/user/desktop
    executeCommand('cd desktop', globalVFS, gitState);
    const pwd2 = executeCommand('pwd', globalVFS, gitState);
    expect(pwd2[0]).toBe('/home/user/desktop');

    // Adım 5: ls → masaüstündeki 9 varsayılan .app uygulamasının tamamı görünmeli
    const ls2 = executeCommand('ls', globalVFS, gitState);
    expect(ls2).toContain('\x1b[36m[app] Terminal\x1b[0m');
    expect(ls2).toContain('\x1b[36m[app] Dosya Gezgini\x1b[0m');
    expect(ls2).toContain('\x1b[36m[app] Kod Editörü\x1b[0m');
    expect(ls2).toContain('\x1b[36m[app] Google Chrome\x1b[0m');
    expect(ls2).toContain('\x1b[36m[app] Microsoft Edge\x1b[0m');
    expect(ls2).toContain('\x1b[36m[app] Monitoring\x1b[0m');
    expect(ls2).toContain('\x1b[36m[app] Tutorial Hub\x1b[0m');
    expect(ls2).toContain('\x1b[36m[app] İş Platformu\x1b[0m');
    expect(ls2).toContain('\x1b[36m[app] Geri Dönüşüm\x1b[0m');

    // Adım 6: touch test.txt
    const touchRes = executeCommand('touch test.txt', globalVFS, gitState);
    expect(touchRes).toEqual([]);

    // Adım 7: ls → test.txt çıktıda olmalı
    const ls3 = executeCommand('ls', globalVFS, gitState);
    expect(ls3).toContain('test.txt');

    // Adım 8: Masaüstü UI / VFS okuma → test.txt masaüstü dizininde reaktif olarak bulunmalı
    const desktopLs = globalVFS.ls('/home/user/desktop');
    expect(desktopLs.entries.some((e) => e.name === 'test.txt')).toBe(true);

    // Adım 9: Dosya Gezgini VFS okuması → test.txt orada da görünmeli
    const catRes = globalVFS.cat('/home/user/desktop/test.txt');
    expect(catRes.success).toBe(true);

    // Adım 10: rm test.txt → dosya hem terminalde hem masaüstünde aynı anda kaybolmalı
    const rmRes = executeCommand('rm test.txt', globalVFS, gitState);
    expect(rmRes).toEqual([]);

    const ls4 = executeCommand('ls', globalVFS, gitState);
    expect(ls4).not.toContain('test.txt');

    const desktopLsFinal = globalVFS.ls('/home/user/desktop');
    expect(desktopLsFinal.entries.some((e) => e.name === 'test.txt')).toBe(false);
  });

  it('ls -l komutu gerçekçi Linux izin ve boyut formatı üretmeli', () => {
    const gitState = { initialized: false, staged: [], commits: [], branch: 'main' };
    globalVFS.cd('/home/user');

    const lsl = executeCommand('ls -l', globalVFS, gitState);
    expect(lsl[0]).toContain('total');
    expect(lsl.some((line) => line.startsWith('drwxr-xr-x'))).toBe(true);
  });

  it('cd terminal hata vermeli (uygulamaların içine cd girilemez)', () => {
    const gitState = { initialized: false, staged: [], commits: [], branch: 'main' };
    globalVFS.cd('/home/user/desktop');

    const cdAppRes = executeCommand('cd Terminal', globalVFS, gitState);
    expect(cdAppRes[0]).toContain('Bu bir uygulama kısayolu, dizin değil');
    expect(cdAppRes[0]).toContain('open "Terminal"');
  });
});
