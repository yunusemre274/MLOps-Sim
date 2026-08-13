import { describe, it, expect, beforeEach } from 'vitest';
import { globalVFS } from '../src/engine/VirtualFileSystem';
import { executeCommand } from '../src/engine/CommandRouter';
import { resetContainers, dockerRun } from '../src/engine/DockerSimulator';
import useGameStore from '../src/store/useGameStore';
import missions from '../src/data/missions.json';

describe('Git Workflow & File Explorer CWD Path Bugfix Verification', () => {
  const gitState = { initialized: false, staged: [], commits: [], branch: 'main' };

  beforeEach(() => {
    resetContainers();
    globalVFS.cd('/home/user');
    useGameStore.setState({
      character: { name: 'Oyuncu', rank: 'junior', careerPoints: 0, totalCompletedMissions: 0 },
      finance: { balance: 500, monthlyPassiveIncome: 0 },
      career: { activeMissions: [], readyToDeliverMissions: [], completedMissions: [] },
    });
  });

  it('1. CWD Path Testi: VFS touch/mkdir bulunulan klasör yoluna dosya oluşturmalı', () => {
    globalVFS.mkdir('/home/user/projects', true);
    globalVFS.cd('/home/user/projects');

    const fullPath = `${globalVFS.pwd()}/app.py`;
    const touchRes = globalVFS.touch(fullPath);
    expect(touchRes.success).toBe(true);

    const lsRes = globalVFS.ls('/home/user/projects');
    expect(lsRes.entries.some((e) => e.name === 'app.py')).toBe(true);
  });

  it('2. Gerçekçi Git Clone Testi: git clone <url> komutu terminal CWD alanına repo dosyalarını aktarmalı', () => {
    const testMission = missions[0]; // Stage 1 mission
    useGameStore.getState().acceptMission(testMission.id);

    globalVFS.mkdir('/home/user/projects', true);
    globalVFS.cd('/home/user/projects');

    const cloneUrl = `https://github.com/techstart_co/${testMission.id}.git`;
    const cloneOutput = executeCommand(`git clone ${cloneUrl}`, globalVFS, gitState);

    expect(cloneOutput.some((line) => line.includes(`Cloning into '${testMission.id}'`))).toBe(true);

    // VFS kontrolü: /home/user/projects/<testMission.id>/app.py oluşturulmuş olmalı
    const catRes = globalVFS.cat(`/home/user/projects/${testMission.id}/app.py`);
    expect(catRes.success).toBe(true);
  });

  it('3. Git Push CI/CD Testi: git push sonrasında readyToDeliverMissions güncellenmeli, İş Platformu üzerinden teslim edilmeli', () => {
    const testMission = missions[0];
    useGameStore.getState().acceptMission(testMission.id);

    globalVFS.mkdir('/home/user/projects', true);
    globalVFS.cd(`/home/user/projects/${testMission.id}`);
    gitState.initialized = true;
    gitState.commits = [{ hash: 'a1b2c3d', message: 'First commit' }];

    // Container henüz çalışmıyor -> git push FAILED vermeli
    const failPush = executeCommand('git push origin main', globalVFS, gitState);
    expect(failPush.some((l) => l.includes('Pipeline FAILED'))).toBe(true);
    expect(useGameStore.getState().career.readyToDeliverMissions.includes(testMission.id)).toBe(false);

    // Container 8080 portunda çalıştırılıyor
    dockerRun(['--name', 'my_service', '-p', '8080:8080', 'python:3.11-slim'], globalVFS);

    // git push tekrar deneniyor -> Pipeline PASSED vermeli ve readyToDeliverMissions eklenmeli (terminalde para/XP verilmez)
    const successPush = executeCommand('git push origin main', globalVFS, gitState);
    expect(successPush.some((l) => l.includes('Pipeline PASSED'))).toBe(true);
    expect(useGameStore.getState().career.readyToDeliverMissions.includes(testMission.id)).toBe(true);
    expect(useGameStore.getState().career.completedMissions.includes(testMission.id)).toBe(false);

    // İş Platformundan "Görevi Teslim Et" butonuna basıldığında (completeMission çağrısı)
    useGameStore.getState().completeMission(testMission.id, testMission.reward.money, testMission.reward.careerPoints, testMission.reward.monthlyMaintenance);
    expect(useGameStore.getState().career.completedMissions.includes(testMission.id)).toBe(true);
    expect(useGameStore.getState().career.readyToDeliverMissions.includes(testMission.id)).toBe(false);
  });
});
