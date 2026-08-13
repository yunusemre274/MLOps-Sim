import { describe, it, expect, beforeEach } from 'vitest';
import { globalVFS } from '../src/engine/VirtualFileSystem';
import { executeCommand } from '../src/engine/CommandRouter';
import { resetContainers, simulateDockerBuild } from '../src/engine/DockerSimulator';
import { parseDockerfile } from '../src/engine/DockerfileParser';
import { checkMission } from '../src/engine/MissionEngine';
import { parseCompose, generateComposeUpLogs } from '../src/engine/ComposeParser';

describe('Round 7 — 4 Katmanlı Doğrulama Motoru ve Docker Test Vakaları', () => {
  const gitState = { initialized: false, staged: [], commits: [], branch: 'main' };

  beforeEach(() => {
    resetContainers();
    globalVFS.cd('/home/user');
  });

  it('Vaka 1: Tamamen boş Dockerfile -> Hata: ilk direktif FROM olmalı', () => {
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile('Dockerfile', '');

    const result = simulateDockerBuild(globalVFS, 'Dockerfile');
    expect(result.success).toBe(false);
    expect(result.logs.some((l) => l.includes('first instruction must be FROM'))).toBe(true);
  });

  it('Vaka 2: Sadece rastgele metin (asdkjaskjd) -> Sözdizimi hatası, tanınmayan direktif', () => {
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile('Dockerfile', 'asdkjaskjd\nfoo bar');

    const result = simulateDockerBuild(globalVFS, 'Dockerfile');
    expect(result.success).toBe(false);
    expect(result.logs.some((l) => l.includes('unknown instruction: asdkjaskjd'))).toBe(true);
  });

  it('Vaka 3: FROM python:3.11 + var olmayan bir dosyayı COPY eden satır -> Semantik hata: COPY failed', () => {
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile('Dockerfile', 'FROM python:3.11\nWORKDIR /app\nCOPY nonexistent_file.py .\nCMD ["python", "app.py"]\n');

    const result = simulateDockerBuild(globalVFS, 'Dockerfile');
    expect(result.success).toBe(false);
    expect(result.logs.some((l) => l.includes('COPY failed: file not found in build context: nonexistent_file.py'))).toBe(true);
  });

  it('Vaka 4: Geçerli tek-katmanlı basit bir Dockerfile -> Build başarılı, docker run çalışır', () => {
    globalVFS.touch('app.py');
    globalVFS.writeFile('app.py', 'print("Hello MLOps")\n');
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile('Dockerfile', 'FROM python:3.11-slim\nWORKDIR /app\nCOPY app.py .\nCMD ["python", "app.py"]\n');

    const result = simulateDockerBuild(globalVFS, 'Dockerfile', { tag: 'myapp:1.0' });
    expect(result.success).toBe(true);
    expect(result.logs.some((l) => l.includes('Successfully built'))).toBe(true);

    const runLogs = executeCommand('docker run --name myapp_c -p 8080:8080 myapp:1.0', globalVFS, gitState);
    expect(runLogs[0]).toContain('Container myapp_c');
    expect(runLogs[0]).toContain('8080');
  });

  it('Vaka 5: Görev "multi-stage" istiyor ama kullanıcı tek aşamalı yazmış -> Build teknik olarak başarılı AMA Check Mission "görev kriterleri karşılanmadı" demeli', () => {
    const singleStageContent = 'FROM python:3.11-slim\nWORKDIR /app\nCOPY . .\nCMD ["python", "app.py"]\n';
    
    // 1. Docker Build teknik olarak geçerli
    const { ast } = parseDockerfile(singleStageContent);
    expect(ast.stages.length).toBe(1);

    // 2. Check Mission kriter kontrolü
    const criteria = {
      hasDockerfile: true,
      multiStage: true,
      stageCount: 2,
    };
    const missionCheck = checkMission(singleStageContent, criteria);
    expect(missionCheck.passed).toBe(false);
    const msCheckItem = missionCheck.checks.find((c) => c.name.includes('Multi-stage'));
    expect(msCheckItem.passed).toBe(false);
  });

  it('Vaka 6: Görev "non-root user" istiyor ama USER direktifi yok -> Build başarılı ama Check Mission eksik/hatalı demeli', () => {
    const rootContent = 'FROM python:3.11-slim\nWORKDIR /app\nCOPY . .\nCMD ["python", "app.py"]\n';
    
    const criteria = {
      hasDockerfile: true,
      hasUser: true,
    };
    const missionCheck = checkMission(rootContent, criteria);
    expect(missionCheck.passed).toBe(false);
    const userCheckItem = missionCheck.checks.find((c) => c.name.includes('USER'));
    expect(userCheckItem.passed).toBe(false);
  });

  it('Docker Compose 4-Katmanlı Doğrulama: YAML syntax, depends_on sırası ve port eşlemesi', () => {
    const composeYAML = `
version: '3.8'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    depends_on:
      - db
  db:
    image: postgres:15
`;
    const { ast } = parseCompose(composeYAML);
    expect(ast.errors.length).toBe(0);
    expect(Object.keys(ast.services)).toContain('web');
    expect(Object.keys(ast.services)).toContain('db');

    const upLogs = generateComposeUpLogs(ast);
    // db önce başlamalı (depends_on sırası)
    const dbIndex = upLogs.findIndex((l) => l.includes('Starting db_1'));
    const webIndex = upLogs.findIndex((l) => l.includes('Starting web_1'));
    expect(dbIndex).toBeLessThan(webIndex);
  });
});
