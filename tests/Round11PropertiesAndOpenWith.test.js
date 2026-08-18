import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileSystem, formatFileSize } from '../src/engine/VirtualFileSystem';
import { getFileTypeName } from '../src/components/computer/PropertiesModal';
import { WindowManagerEngine } from '../src/engine/WindowManager';

describe('Round 11 — GÖREV GRUBU 3: Klasör/Dosya Özellikleri ve Terminal/IDE İle Aç', () => {
  let vfs;

  beforeEach(() => {
    vfs = new VirtualFileSystem();
  });

  it('formatFileSize baytları okunabilir formatta biçimlendirir', () => {
    expect(formatFileSize(500)).toBe('500 bayt');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(1048576)).toBe('1.00 MB');
    expect(formatFileSize(1073741824)).toBe('1.00 GB');
  });

  it('Dosya özelliklerini (getStats) eksiksiz hesaplar', () => {
    vfs.mkdir('/home/user/test', true);
    vfs.writeFile('/home/user/test/app.py', 'print("hello world from fastapi")\n');

    const stats = vfs.getStats('/home/user/test/app.py');
    expect(stats.success).toBe(true);
    expect(stats.name).toBe('app.py');
    expect(stats.path).toBe('/home/user/test/app.py');
    expect(stats.type).toBe('file');
    expect(stats.sizeBytes).toBeGreaterThan(20);
    expect(stats.owner).toBe('user');
    expect(stats.fileCount).toBe(1);
    expect(stats.dirCount).toBe(0);
  });

  it('Klasör özelliklerini (getStats) recursive olarak hesaplar', () => {
    vfs.mkdir('/home/user/myproject/src', true);
    vfs.writeFile('/home/user/myproject/src/main.py', 'from fastapi import FastAPI');
    vfs.writeFile('/home/user/myproject/requirements.txt', 'fastapi\nuvicorn');
    vfs.writeFile('/home/user/myproject/Dockerfile', 'FROM python:3.11-slim');

    const stats = vfs.getStats('/home/user/myproject');
    expect(stats.success).toBe(true);
    expect(stats.name).toBe('myproject');
    expect(stats.path).toBe('/home/user/myproject');
    expect(stats.type).toBe('dir');
    expect(stats.fileCount).toBe(3);
    expect(stats.dirCount).toBe(1); // src alt klasörü
    expect(stats.sizeBytes).toBeGreaterThan(50);
  });

  it('getFileTypeName dosya uzantılarına göre doğru tür isimlerini döndürür', () => {
    expect(getFileTypeName({ type: 'dir', name: 'myfolder' })).toBe('Dosya Klasörü');
    expect(getFileTypeName({ type: 'file', name: 'app.py' })).toBe('Python Dosyası (.py)');
    expect(getFileTypeName({ type: 'file', name: 'main.js' })).toBe('JavaScript Dosyası (.js)');
    expect(getFileTypeName({ type: 'file', name: 'config.json' })).toBe('JSON Veri Dosyası (.json)');
    expect(getFileTypeName({ type: 'file', name: 'Dockerfile' })).toBe('Docker İmaj Tanım Dosyası');
    expect(getFileTypeName({ type: 'file', name: 'docker-compose.yml' })).toBe('YAML Konfigürasyon Dosyası (.yml)');
    expect(getFileTypeName({ type: 'file', name: 'README.md' })).toBe('Markdown Belgesi (.md)');
  });

  it('WindowManager openApp ile initialPath aktarımını destekler', () => {
    const wm = new WindowManagerEngine();

    const termWinId = wm.openApp('terminal', { initialPath: '/home/user/projects' });
    const termWin = wm.getState().openWindows.find((w) => w.id === termWinId);
    expect(termWin).toBeDefined();
    expect(termWin.extraProps.initialPath).toBe('/home/user/projects');

    const editWinId = wm.openApp('editor', { initialPath: '/home/user/projects/repo' });
    const editWin = wm.getState().openWindows.find((w) => w.id === editWinId);
    expect(editWin).toBeDefined();
    expect(editWin.extraProps.initialPath).toBe('/home/user/projects/repo');
  });
});
