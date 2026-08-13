import { describe, it, expect, beforeEach } from 'vitest';
import { executeCommand } from '../src/engine/CommandRouter.js';
import { globalVFS } from '../src/engine/VirtualFileSystem.js';
import { windowManager } from '../src/engine/WindowManager.js';
import useGameStore from '../src/store/useGameStore.js';
import { getFileLanguage, EXTENSION_TO_LANGUAGE } from '../src/components/computer/EditorTab.jsx';

describe('Round 9 — Görev Grubu 1: Görev İçeriği Doğruluğu & README.md Görev Tanımı', () => {
  beforeEach(() => {
    globalVFS.reset();
    useGameStore.setState({
      career: {
        rank: 'Junior MLOps Engineer',
        reputation: 10,
        completedMissions: [],
        activeMissions: [],
        activeMissionsData: {},
      },
    });
  });

  it('Aşama 1-4 görevinde git clone yapıldığında README.md oluşturulmalı ve senaryo metnini içermelidir', async () => {
    const cloneOut = await executeCommand('git clone https://github.com/techstart/ts_mission_1.git', globalVFS);
    expect(cloneOut.some((l) => l.includes('Cloning into'))).toBe(true);

    const readmeRes = globalVFS.cat('ts_mission_1/README.md');
    expect(readmeRes.success).toBe(true);
    expect(readmeRes.content).toContain('FastAPI Hello World Containerize');
    expect(readmeRes.content).toContain('TechStart');
    expect(readmeRes.content).toContain('Aşama 1');
    expect(readmeRes.content).toContain('Görev Tanımı ve Senaryo');
    expect(readmeRes.content).toContain('Teslim Edilir');

    // Statik kod dosyaları bulunmalı
    const appRes = globalVFS.cat('ts_mission_1/app.py');
    expect(appRes.success).toBe(true);
  });

  it('Aşama 5+ (Mid-Senior) görevinde git clone yapıldığında hazır Dockerfile gelmemeli, sadece README.md ve statik kod gelmelidir', async () => {
    const cloneOut = await executeCommand('git clone https://github.com/techstart/ts_cicd_1.git', globalVFS);
    expect(cloneOut.some((l) => l.includes('Cloning into'))).toBe(true);

    const readmeRes = globalVFS.cat('ts_cicd_1/README.md');
    expect(readmeRes.success).toBe(true);
    expect(readmeRes.content).toContain('GitHub Actions CI Pipeline');
    expect(readmeRes.content).toContain('Aşama 5');

    // Hazır Dockerfile ASLA VFS'e yazılmamalı
    const dockerfileRes = globalVFS.cat('ts_cicd_1/Dockerfile');
    expect(dockerfileRes.success).toBe(false);

    // Statik kod dosyası mevcut olmalı
    const appRes = globalVFS.cat('ts_cicd_1/app.py');
    expect(appRes.success).toBe(true);
  });
});

describe('Round 9 — Görev Grubu 2: Klasör Çift Tıklama ve Navigasyon', () => {
  beforeEach(() => {
    windowManager.openWindows = [];
    windowManager.activeWindowId = null;
  });

  it('Explorer kapalıyken initialPath ile açıldığında pencere o path ile oluşturulmalıdır', () => {
    const winId = windowManager.openApp('explorer', { initialPath: '/home/user/projects' });
    const win = windowManager.openWindows.find((w) => w.id === winId);

    expect(win).toBeDefined();
    expect(win.extraProps.initialPath).toBe('/home/user/projects');
  });

  it('Explorer açıkken başka bir klasöre tıklandığında yeni pencere açılmamalı, var olan pencerenin pathi güncellenmelidir', () => {
    const winId1 = windowManager.openApp('explorer', { initialPath: '/home/user/projects' });
    expect(windowManager.openWindows.length).toBe(1);

    const winId2 = windowManager.openApp('explorer', { initialPath: '/home/user/desktop' });
    expect(windowManager.openWindows.length).toBe(1);
    expect(winId2).toBe(winId1);

    const win = windowManager.openWindows[0];
    expect(win.extraProps.initialPath).toBe('/home/user/desktop');
  });
});

describe('Round 9 — Görev Grubu 3: Monaco Editor / Syntax Highlighting Dil Modları', () => {
  it('Dosya uzantılarından doğru dil modu eşlemesini yapmalıdır', () => {
    expect(getFileLanguage('Dockerfile')).toBe('dockerfile');
    expect(getFileLanguage('Dockerfile.prod')).toBe('dockerfile');
    expect(getFileLanguage('docker-compose.yml')).toBe('yaml');
    expect(getFileLanguage('docker-compose.yaml')).toBe('yaml');
    expect(getFileLanguage('app.py')).toBe('python');
    expect(getFileLanguage('README.md')).toBe('markdown');
    expect(getFileLanguage('package.json')).toBe('json');
    expect(getFileLanguage('server.js')).toBe('javascript');
    expect(getFileLanguage('main.go')).toBe('go');
    expect(getFileLanguage('.env')).toBe('shell');
    expect(getFileLanguage('deploy.sh')).toBe('shell');
    expect(getFileLanguage('.gitignore')).toBe('plaintext');
    expect(getFileLanguage('notes.txt')).toBe('plaintext');
  });

  it('EXTENSION_TO_LANGUAGE tablosu tüm gerekli dosya uzantılarını içermelidir', () => {
    expect(EXTENSION_TO_LANGUAGE['.py']).toBe('python');
    expect(EXTENSION_TO_LANGUAGE['.yml']).toBe('yaml');
    expect(EXTENSION_TO_LANGUAGE['.yaml']).toBe('yaml');
    expect(EXTENSION_TO_LANGUAGE['.md']).toBe('markdown');
    expect(EXTENSION_TO_LANGUAGE['.json']).toBe('json');
    expect(EXTENSION_TO_LANGUAGE['.go']).toBe('go');
    expect(EXTENSION_TO_LANGUAGE['.js']).toBe('javascript');
    expect(EXTENSION_TO_LANGUAGE['.ts']).toBe('typescript');
  });
});
