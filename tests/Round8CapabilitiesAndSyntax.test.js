import { describe, it, expect, beforeEach } from 'vitest';
import { globalVFS } from '../src/engine/VirtualFileSystem';
import { executeCommand } from '../src/engine/CommandRouter';
import { resetContainers, simulateDockerBuild, dockerRun } from '../src/engine/DockerSimulator';

describe('Round 8 — Base Image Yetenek Modeli, Komut Sözdizimi ve Runtime Executable Doğrulaması', () => {
  const gitState = { initialized: false, staged: [], commits: [], branch: 'main' };

  beforeEach(() => {
    resetContainers();
    globalVFS.cd('/home/user');
  });

  it('Senaryo 1 (Ekran Görüntüsü Vakası): nginx:alpine üzerinde pip çağrıldığında build Step 4\'te durmalı, CMD\'ye geçmemeli', () => {
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile(
      'Dockerfile',
      'FROM nginx:alpine\nWORKDIR /app\nCOPY . .\nRUN pip install requirements.txt\nCMD ["python","app.py"]\n'
    );

    const result = simulateDockerBuild(globalVFS, 'Dockerfile');
    expect(result.success).toBe(false);
    // Adım 4'te durmalı
    expect(result.logs.some((l) => l.includes('RUN pip install requirements.txt'))).toBe(true);
    expect(result.logs.some((l) => l.includes('pip: not found'))).toBe(true);
    // Adım 5 (CMD) loglara HİÇ eklenmemeli
    expect(result.logs.some((l) => l.includes('Step 5/5'))).toBe(false);
  });

  it('Senaryo 2: Doğru image + doğru komut (python:3.11-slim + pip install -r requirements.txt) -> build tamamen başarılı olmalı', () => {
    globalVFS.touch('requirements.txt');
    globalVFS.writeFile('requirements.txt', 'fastapi==0.100.0\nuvicorn>=0.22.0\n');
    globalVFS.touch('app.py');
    globalVFS.writeFile('app.py', 'print("API running")\n');
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile(
      'Dockerfile',
      'FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY app.py .\nCMD ["python", "app.py"]\n'
    );

    const result = simulateDockerBuild(globalVFS, 'Dockerfile', { tag: 'fastapi-app:1.0' });
    expect(result.success).toBe(true);
    expect(result.logs.some((l) => l.includes('Collecting fastapi'))).toBe(true);
    expect(result.logs.some((l) => l.includes('Successfully built'))).toBe(true);
  });

  it('Senaryo 3: Doğru image ama -r bayrağı unutulmuş (pip install requirements.txt) -> pip dağıtım bulunamadı hatası vermeli', () => {
    globalVFS.touch('requirements.txt');
    globalVFS.writeFile('requirements.txt', 'fastapi\n');
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile(
      'Dockerfile',
      'FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install requirements.txt\nCMD ["python", "app.py"]\n'
    );

    const result = simulateDockerBuild(globalVFS, 'Dockerfile');
    expect(result.success).toBe(false);
    expect(result.logs.some((l) => l.includes('No matching distribution found for requirements.txt'))).toBe(true);
  });

  it('Senaryo 4: alpine:latest üzerinde apt-get çağrıldığında apt-get: not found hatası vermeli', () => {
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile('Dockerfile', 'FROM alpine:latest\nRUN apt-get update\n');

    const result = simulateDockerBuild(globalVFS, 'Dockerfile');
    expect(result.success).toBe(false);
    expect(result.logs.some((l) => l.includes('apt-get: not found'))).toBe(true);
  });

  it('Senaryo 5: Multi-stage build aşamalar arası izolasyon (builder stage\'deki go, final alpine stage\'e taşınmazsa kullanılamaz)', () => {
    globalVFS.touch('go.mod');
    globalVFS.writeFile('go.mod', 'module example.com/app\ngo 1.22\n');
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile(
      'Dockerfile',
      'FROM golang:1.22 AS builder\nWORKDIR /app\nCOPY go.mod .\nRUN go build -o myapp .\n\nFROM alpine:latest\nWORKDIR /app\nRUN go version\nCMD ["./myapp"]\n'
    );

    const result = simulateDockerBuild(globalVFS, 'Dockerfile');
    expect(result.success).toBe(false);
    expect(result.logs.some((l) => l.includes('go: not found'))).toBe(true);
  });

  it('Senaryo 6 (Katman 4 Runtime Executable Doğrulaması): İmajda olmayan binary CMD ile çalıştırılmak istendiğinde docker run OCI hatası vermeli', () => {
    // node:20-alpine (python içermez)
    globalVFS.touch('Dockerfile');
    globalVFS.writeFile('Dockerfile', 'FROM node:20-alpine\nWORKDIR /app\nCMD ["python", "app.py"]\n');

    const buildRes = simulateDockerBuild(globalVFS, 'Dockerfile', { tag: 'node-with-python-cmd:latest' });
    expect(buildRes.success).toBe(true); // Build syntactically & semantically geçerli

    // docker run aşamasında python binary bulunamadı hatası üretmeli
    const runRes = dockerRun('node-with-python-cmd:latest', { name: 'failing_node_app' });
    expect(runRes.success).toBe(false);
    expect(runRes.message).toContain('OCI runtime create failed');
    expect(runRes.message).toContain('python');
  });

  it('NPM ve Go Sözdizimi / Context Kontrolleri (package.json veya go.mod eksikse hata vermeli)', () => {
    globalVFS.touch('Dockerfile.npm');
    globalVFS.writeFile('Dockerfile.npm', 'FROM node:20\nWORKDIR /app\nRUN npm install\n');

    const npmRes = simulateDockerBuild(globalVFS, 'Dockerfile.npm');
    expect(npmRes.success).toBe(false);
    expect(npmRes.logs.some((l) => l.includes('package.json'))).toBe(true);
  });
});
