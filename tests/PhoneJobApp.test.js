import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../src/store/useGameStore';
import { globalVFS } from '../src/engine/VirtualFileSystem';
import { executeCommand } from '../src/engine/CommandRouter';
import missions from '../src/data/missions.json';

describe('PhoneJobApp & Single Source of Truth VFS Sync Test', () => {
  beforeEach(() => {
    useGameStore.setState({
      career: {
        activeMissions: [],
        completedMissions: [],
        ownCompany: null,
        employees: [],
      },
    });
  });

  it('Telefondan iş kabul edildiğinde activeMissions güncellenmeli ve git clone ile VFS projesi oluşturulabilmeli', () => {
    const testMission = missions[0]; // Stage 1 mission
    expect(testMission).toBeDefined();

    // 1. Telefondan kabul et
    useGameStore.getState().acceptMission(testMission.id);

    // 2. Store kontrolü: activeMissions listesinde olmalı
    const activeMissions = useGameStore.getState().career.activeMissions;
    expect(activeMissions).toContain(testMission.id);

    // 3. Terminalde git clone klonlama kontrolü
    globalVFS.mkdir('/home/user/projects', true);
    globalVFS.cd('/home/user/projects');
    const cloneUrl = `https://github.com/techstart_co/${testMission.id}.git`;
    executeCommand(`git clone ${cloneUrl}`, globalVFS, { initialized: false, staged: [], commits: [], branch: 'main' });

    // VFS kontrolü - /home/user/projects/<testMission.id> klasörü klonlanmış olmalı
    const projectPath = `/home/user/projects/${testMission.id}`;
    const { node, found } = globalVFS._getNode(projectPath);
    expect(found).toBe(true);
    expect(node._type).toBe('dir');
  });
});
