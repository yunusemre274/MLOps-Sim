/**
 * Round6DockerVerification.test.js — Round 6 Zorunlu 6 Senaryoluk Docker Doğrulama Testi
 *
 * 1. docker run --name test1 myimage VE docker container run --name test2 myimage ikisi de container başlatmalı.
 * 2. docker ps VE docker container ls aynı listeyi göstermeli.
 * 3. docker stop test1 VE docker container stop test2 ikisi de ilgili container'ı durdurmalı.
 * 4. docker images VE docker image ls aynı listeyi göstermeli.
 * 5. docker rmi VE docker image rm aynı sonucu vermeli.
 * 6. Ekran görüntüsündeki senaryo: Dockerfile kaydet → docker build -t myimage . → docker container run --name myfirstapp myimage:latest → docker container stop <id> (hiçbiri hata vermemeli).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { globalVFS } from '../src/engine/VirtualFileSystem';
import { executeCommand } from '../src/engine/CommandRouter';
import { resetContainers } from '../src/engine/DockerSimulator';

describe('Round 6 — Docker CLI Tam Komut Kapsaması ve Senaryo Doğrulaması', () => {
  const gitState = { initialized: false, staged: [], commits: [], branch: 'main' };

  beforeEach(() => {
    resetContainers();
    globalVFS.cd('/home/user');
  });

  it('Senaryo 1: docker run VE docker container run ikisi de container başlatmalı', () => {
    const res1 = executeCommand('docker run --name test1 python:3.11-slim', globalVFS, gitState);
    expect(res1[0]).toContain('Container test1');

    const res2 = executeCommand('docker container run --name test2 python:3.11-slim', globalVFS, gitState);
    expect(res2[0]).toContain('Container test2');
  });

  it('Senaryo 2: docker ps VE docker container ls aynı listeyi göstermeli', () => {
    executeCommand('docker run --name app1 python:3.11-slim', globalVFS, gitState);

    const psRes = executeCommand('docker ps', globalVFS, gitState);
    const containerLsRes = executeCommand('docker container ls', globalVFS, gitState);

    expect(psRes).toEqual(containerLsRes);
    expect(psRes.some((line) => line.includes('app1'))).toBe(true);
  });

  it('Senaryo 3: docker stop test1 VE docker container stop test2 ikisi de container durdurmalı', () => {
    executeCommand('docker run --name test1 python:3.11-slim', globalVFS, gitState);
    executeCommand('docker run --name test2 python:3.11-slim', globalVFS, gitState);

    const stop1 = executeCommand('docker stop test1', globalVFS, gitState);
    expect(stop1[0]).toContain('Container test1');

    const stop2 = executeCommand('docker container stop test2', globalVFS, gitState);
    expect(stop2[0]).toContain('Container test2');
  });

  it('Senaryo 4: docker images VE docker image ls aynı listeyi göstermeli', () => {
    const imagesRes = executeCommand('docker images', globalVFS, gitState);
    const imageLsRes = executeCommand('docker image ls', globalVFS, gitState);

    expect(imagesRes).toEqual(imageLsRes);
    expect(imagesRes.some((line) => line.includes('python'))).toBe(true);
  });

  it('Senaryo 5: docker rmi VE docker image rm aynı şekilde image silmeli', () => {
    executeCommand('docker pull alpine', globalVFS, gitState);

    const rmiRes = executeCommand('docker rmi alpine', globalVFS, gitState);
    expect(rmiRes[0]).toContain('Untagged: alpine');

    executeCommand('docker pull alpine', globalVFS, gitState);
    const imageRmRes = executeCommand('docker image rm alpine', globalVFS, gitState);
    expect(imageRmRes[0]).toContain('Untagged: alpine');
  });

  it('Senaryo 6: Gerçek Kullanıcı Akışı (build → container run → container stop)', () => {
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile('Dockerfile', 'FROM python:3.11-slim\nWORKDIR /app\nCOPY . .\nCMD ["python", "app.py"]\n');

    const buildLogs = executeCommand('docker build -t myimage .', globalVFS, gitState);
    expect(buildLogs.some((line) => line.includes('Successfully built'))).toBe(true);

    const runRes = executeCommand('docker container run --name myfirstapp app:latest', globalVFS, gitState);
    expect(runRes[0]).toContain('Container myfirstapp');
    expect(runRes[0]).not.toContain('is not a docker command');

    const stopRes = executeCommand('docker container stop myfirstapp', globalVFS, gitState);
    expect(stopRes[0]).toContain('stopped');
    expect(stopRes[0]).not.toContain('is not a docker command');
  });

  it('Bonus: docker container inspect, top, cp, stats, system df/prune', () => {
    executeCommand('docker run --name c_bonus python:3.11-slim', globalVFS, gitState);

    const inspectRes = executeCommand('docker container inspect c_bonus', globalVFS, gitState);
    expect(inspectRes.join('\n')).toContain('"Name": "/c_bonus"');

    const topRes = executeCommand('docker top c_bonus', globalVFS, gitState);
    expect(topRes[0]).toContain('PID');

    const cpRes = executeCommand('docker cp c_bonus:/app.py /home/user/copied_app.py', globalVFS, gitState);
    expect(cpRes[0]).toContain('Successfully copied');
    expect(globalVFS.cat('/home/user/copied_app.py').success).toBe(true);

    const dfRes = executeCommand('docker system df', globalVFS, gitState);
    expect(dfRes[0]).toContain('TYPE');

    const helpContainer = executeCommand('docker container --help', globalVFS, gitState);
    expect(helpContainer[0]).toContain('Usage:  docker container COMMAND');
  });
});
