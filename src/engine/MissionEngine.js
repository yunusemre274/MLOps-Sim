/**
 * MissionEngine.js — Görev kontrol motoru
 *
 * Görev başvurusu, görev teslimi (Dockerfile kontrolü), puan hesaplama,
 * aylık bakım geliri yönetimi.
 */

import missions from '../data/missions.json';
import companies from '../data/companies.json';
import { parseDockerfile } from './DockerfileParser.js';
import useGameStore from '../store/useGameStore.js';

/**
 * Tüm görevleri getirir.
 */
export function getAllMissions() {
  return missions;
}

/**
 * Tüm şirketleri getirir.
 */
export function getAllCompanies() {
  return companies;
}

/**
 * Bir görevin detayını getirir.
 */
export function getMission(missionId) {
  return missions.find((m) => m.id === missionId) || null;
}

/**
 * Oyuncunun rütbesine uygun şirketleri filtreler.
 */
export function getAvailableCompanies(rank) {
  const rankOrder = ['junior', 'junior_plus', 'mid', 'mid_senior', 'senior', 'lead'];
  const playerIdx = rankOrder.indexOf(rank);
  return companies.filter((c) => rankOrder.indexOf(c.requiredRank) <= playerIdx);
}

/**
 * Bir görev için repo dosyalarını VFS'ye yazar.
 * @param {VirtualFileSystem} vfs
 * @param {Object} mission
 */
export function setupMissionRepo(vfs, mission) {
  const repoDir = mission.id;
  vfs.mkdir(repoDir);

  for (const [filename, content] of Object.entries(mission.repoFiles)) {
    // Alt dizin varsa oluştur
    if (filename.includes('/')) {
      const dir = `${repoDir}/${filename.split('/').slice(0, -1).join('/')}`;
      vfs.mkdir(dir);
    }
    vfs.writeFile(`${repoDir}/${filename}`, content);
  }

  return repoDir;
}

/**
 * Dockerfile'ı beklenen kriterlerle karşılaştırır (kural tabanlı).
 *
 * @param {string} dockerfileContent - Dockerfile içeriği
 * @param {Object} criteria - mission.expectedCriteria
 * @returns {{ passed: boolean, score: number, maxScore: number, checks: Array }}
 */
export function checkMission(dockerfileContent, criteria) {
  const { ast } = parseDockerfile(dockerfileContent);
  const checks = [];
  let score = 0;
  let maxScore = 0;

  // Dockerfile varlığı
  if (criteria.hasDockerfile) {
    maxScore += 10;
    const pass = ast.stages.length > 0 && ast.errors.length === 0;
    if (pass) score += 10;
    checks.push({ name: 'Geçerli Dockerfile', passed: pass, points: 10 });
  }

  // Base image kontrolü
  if (criteria.baseImage) {
    maxScore += 15;
    const pass = ast.stages.some((s) => s.baseImage.includes(criteria.baseImage));
    if (pass) score += 15;
    checks.push({ name: `Base image: ${criteria.baseImage}`, passed: pass, points: 15 });
  }

  // Multi-stage kontrolü
  if (criteria.multiStage) {
    maxScore += 20;
    const pass = ast.stages.length >= (criteria.stageCount || 2);
    if (pass) score += 20;
    checks.push({ name: `Multi-stage build (${criteria.stageCount || 2} stage)`, passed: pass, points: 20 });
  }

  // WORKDIR kontrolü
  if (criteria.hasWorkdir) {
    maxScore += 10;
    const pass = ast.stages.some((s) =>
      s.instructions.some((i) => i.directive === 'WORKDIR')
    );
    if (pass) score += 10;
    checks.push({ name: 'WORKDIR tanımlanmış', passed: pass, points: 10 });
  }

  // COPY kontrolü
  if (criteria.hasCopy) {
    maxScore += 10;
    const pass = ast.stages.some((s) =>
      s.instructions.some((i) => i.directive === 'COPY' || i.directive === 'ADD')
    );
    if (pass) score += 10;
    checks.push({ name: 'COPY/ADD kullanılmış', passed: pass, points: 10 });
  }

  // EXPOSE kontrolü
  if (criteria.hasExpose) {
    maxScore += 10;
    const exposeInstr = ast.stages.flatMap((s) =>
      s.instructions.filter((i) => i.directive === 'EXPOSE')
    );
    let pass = exposeInstr.length > 0;

    // Spesifik port kontrolü
    if (criteria.exposedPort && pass) {
      pass = exposeInstr.some((i) => i.parsed.ports?.includes(criteria.exposedPort));
    }
    if (pass) score += 10;
    checks.push({ name: criteria.exposedPort ? `EXPOSE ${criteria.exposedPort}` : 'EXPOSE tanımlanmış', passed: pass, points: 10 });
  }

  // CMD kontrolü
  if (criteria.hasCmd) {
    maxScore += 15;
    const pass = ast.stages.some((s) =>
      s.instructions.some((i) => i.directive === 'CMD' || i.directive === 'ENTRYPOINT')
    );
    if (pass) score += 15;
    checks.push({ name: 'CMD/ENTRYPOINT tanımlanmış', passed: pass, points: 15 });
  }

  // HEALTHCHECK bonus
  if (criteria.hasHealthcheck !== undefined) {
    maxScore += 10;
    const hasHC = ast.stages.some((s) =>
      s.instructions.some((i) => i.directive === 'HEALTHCHECK')
    );
    if (criteria.hasHealthcheck && hasHC) {
      score += 10;
      checks.push({ name: 'HEALTHCHECK tanımlanmış (bonus)', passed: true, points: 10 });
    } else if (!criteria.hasHealthcheck && hasHC) {
      score += 10; // Bonus: beklenmiyordu ama eklediyse ekstra puan
      checks.push({ name: 'HEALTHCHECK eklendi (bonus)', passed: true, points: 10 });
    } else {
      checks.push({ name: 'HEALTHCHECK (opsiyonel)', passed: false, points: 10 });
    }
  }

  // Non-root USER kontrolü
  if (criteria.hasUser || criteria.nonRootUser) {
    maxScore += 15;
    const pass = ast.stages.some((s) =>
      s.instructions.some((i) => i.directive === 'USER')
    );
    if (pass) score += 15;
    checks.push({ name: 'Non-root USER tanımlanmış', passed: pass, points: 15 });
  }

  const passed = score >= maxScore * 0.7; // %70 geçme eşiği

  return { passed, score, maxScore, checks };
}

/**
 * Görev teslimini işler — puan ve para verir, kariyer ilerletir.
 */
export function submitMission(missionId, checkResult) {
  const mission = getMission(missionId);
  if (!mission || !checkResult.passed) return { success: false };

  const state = useGameStore.getState();

  // Puanları hesapla
  const ratio = checkResult.score / checkResult.maxScore;
  const moneyReward = Math.floor(mission.reward.money * ratio);
  const careerReward = Math.floor(mission.reward.careerPoints * ratio);

  // Store güncelle
  useGameStore.getState().addMoney(moneyReward);
  useGameStore.getState().addCareerPoints(careerReward);

  // Tamamlanan görevler listesine ekle
  useGameStore.setState((s) => ({
    character: {
      ...s.character,
      totalCompletedMissions: s.character.totalCompletedMissions + 1,
    },
    career: {
      ...s.career,
      completedMissions: [...s.career.completedMissions, missionId],
    },
    finance: {
      ...s.finance,
      monthlyPassiveIncome: s.finance.monthlyPassiveIncome + (mission.reward.monthlyMaintenance || 0),
    },
  }));

  useGameStore.getState().addEvent(`Görev tamamlandı: ${mission.title} (+₺${moneyReward}, +${careerReward} KP)`);

  return {
    success: true,
    moneyReward,
    careerReward,
    monthlyMaintenance: mission.reward.monthlyMaintenance || 0,
    ratio,
  };
}

/**
 * git push ile tetiklenen doğrulama motoru.
 *
 * Kabul Kriteri:
 * 1. Görevin gerektirdiği portu bulur (expectedCriteria.exposedPort veya default 8080).
 * 2. DockerSimulator running container listesinde 'running' statüsünde ve o porta bağlı bir container arar.
 * 3. Varsa başarı döner, yoksa hata mesajı döner.
 */
export function verifyMission(missionId, vfs, runningContainers = []) {
  const mission = typeof missionId === 'object' ? missionId : getMission(missionId);
  if (!mission) {
    return {
      passed: false,
      requiredPort: 8080,
      message: 'HATA: Görev bilgisi sistemde bulunamadı.',
    };
  }

  const requiredPort = mission.expectedCriteria?.exposedPort || mission.requiredPort || 8080;

  // Running container kontrolü
  const activeContainer = runningContainers.find((c) => {
    if (c.status !== 'running') return false;
    const portStr = String(c.port || c.ports || '');
    return portStr.includes(String(requiredPort));
  });

  if (!activeContainer) {
    return {
      passed: false,
      requiredPort,
      message: `HATA: Port ${requiredPort} üzerinde 'running' statüsünde çalışan bir container bulunamadı.`,
    };
  }

  return {
    passed: true,
    requiredPort,
    containerName: activeContainer.name || activeContainer.id,
    message: `Port ${requiredPort} üzerinde '${activeContainer.name || activeContainer.id}' container'ı aktif ve çalışıyor.`,
  };
}

