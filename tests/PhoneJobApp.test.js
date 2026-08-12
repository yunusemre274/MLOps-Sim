import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../src/store/useGameStore';
import { globalVFS } from '../src/engine/VirtualFileSystem';
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

  it('Telefondan iş kabul edildiğinde useGameStore activeMissions güncellenmeli ve VFS projeyi oluşturmalı', () => {
    const testMission = missions[0]; // Stage 1 mission
    expect(testMission).toBeDefined();

    // Store üzerinden kabul et
    useGameStore.getState().acceptMission(testMission.id);

    // 1. Store kontrolü
    const activeMissions = useGameStore.getState().career.activeMissions;
    expect(activeMissions).toContain(testMission.id);

    // 2. VFS kontrolü - /home/user/projects/<mission.id> klasörü oluşturulmuş olmalı
    const projectPath = `/home/user/projects/${testMission.id}`;
    const { node, found } = globalVFS._getNode(projectPath);
    expect(found).toBe(true);
    expect(node._type).toBe('dir');
  });
});
