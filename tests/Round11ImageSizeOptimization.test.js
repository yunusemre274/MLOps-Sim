import { describe, it, expect } from 'vitest';
import {
  calculateSimulatedImageSize,
  formatImageSize,
  BASE_IMAGE_SIZES,
  simulateDockerBuild,
} from '../src/engine/DockerSimulator';
import { parseDockerfile } from '../src/engine/DockerfileParser';
import { checkMission } from '../src/engine/MissionEngine';
import { VirtualFileSystem } from '../src/engine/VirtualFileSystem';

describe('Round 11 — GÖREV GRUBU 1: İmaj Boyutu Optimizasyon Doğrulaması', () => {
  it('Base image taban boyutlarını doğru şekilde hesaplar', () => {
    expect(BASE_IMAGE_SIZES['python:3.11']).toBe(950);
    expect(BASE_IMAGE_SIZES['python:3.11-slim']).toBe(150);
    expect(BASE_IMAGE_SIZES['alpine:latest']).toBe(7.5);
    expect(BASE_IMAGE_SIZES['node:20']).toBe(1100);
    expect(BASE_IMAGE_SIZES['node:20-alpine']).toBe(180);

    const { ast: pythonAst } = parseDockerfile('FROM python:3.11\nWORKDIR /app\n');
    const pythonSize = calculateSimulatedImageSize(pythonAst);
    expect(pythonSize.totalSizeMB).toBe(950);
    expect(pythonSize.formattedSize).toBe('950MB');

    const { ast: slimAst } = parseDockerfile('FROM python:3.11-slim\nWORKDIR /app\n');
    const slimSize = calculateSimulatedImageSize(slimAst);
    expect(slimSize.totalSizeMB).toBe(150);
  });

  it('RUN komutlarının paket boyutlarını imaj boyutuna ekler', () => {
    const dockerfile = `
FROM python:3.11-slim
RUN apt-get update && apt-get install -y build-essential
RUN pip install fastapi uvicorn
COPY . /app
`;
    const { ast } = parseDockerfile(dockerfile);
    const sizeInfo = calculateSimulatedImageSize(ast);
    // 150 (base) + 280 (build-essential) + 35 (fastapi/uvicorn) + 110 (COPY . .) = 575MB
    expect(sizeInfo.totalSizeMB).toBeGreaterThan(500);
    expect(sizeInfo.breakdown.length).toBeGreaterThan(1);
  });

  it('Multi-stage build yapısında yalnızca nihai (final) stage boyutunu hesaplar', () => {
    const multiStageDockerfile = `
FROM python:3.11 AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y gcc build-essential
RUN pip install --no-cache-dir torch

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY app.py .
CMD ["python", "app.py"]
`;
    const { ast } = parseDockerfile(multiStageDockerfile);
    const sizeInfo = calculateSimulatedImageSize(ast);

    expect(sizeInfo.isMultiStage).toBe(true);
    // Final stage: python:3.11-slim (150MB) + 2x COPY (2MB each) = 154MB
    expect(sizeInfo.totalSizeMB).toBeLessThan(300);
    expect(sizeInfo.formattedSize).toBe('154MB');
  });

  it('formatImageSize MB ve GB birimlerini doğru formatlar', () => {
    expect(formatImageSize(150)).toBe('150MB');
    expect(formatImageSize(850)).toBe('850MB');
    expect(formatImageSize(1536)).toBe('1.50GB');
    expect(formatImageSize(20480)).toBe('20.00GB');
  });

  it('checkMission maxImageSizeMB kuralını başarıyla doğrular', () => {
    const goodDockerfile = `
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 8080
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
`;
    const criteria = {
      hasDockerfile: true,
      baseImage: 'python',
      hasExpose: true,
      maxImageSizeMB: 500,
    };

    const res = checkMission(goodDockerfile, criteria);
    expect(res.passed).toBe(true);
    const sizeCheck = res.checks.find((c) => c.name.includes('İmaj boyutu'));
    expect(sizeCheck).toBeDefined();
    expect(sizeCheck.passed).toBe(true);
  });

  it('checkMission boyut limiti aşıldığında eğitici ve somut feedback üretir', () => {
    const bloatedDockerfile = `
FROM python:3.11
WORKDIR /app
RUN apt-get update && apt-get install -y gcc build-essential
RUN pip install torch
COPY . .
EXPOSE 8080
CMD ["python", "app.py"]
`;
    const criteria = {
      hasDockerfile: true,
      baseImage: 'python',
      maxImageSizeMB: 500,
    };

    const res = checkMission(bloatedDockerfile, criteria);
    const sizeCheck = res.checks.find((c) => c.name.includes('İmaj boyutu'));
    expect(sizeCheck.passed).toBe(false);
    expect(sizeCheck.feedback).toContain('python:3.11 yerine python:3.11-slim veya alpine kullanılsaydı');
    expect(sizeCheck.feedback).toContain('Multi-stage build');
  });

  it('simulateDockerBuild imaj kaydında hesaplanan sizeMB ve size alanlarını saklar', () => {
    const vfs = new VirtualFileSystem();
    vfs.mkdir('/home/user/app', true);
    vfs.writeFile(
      '/home/user/app/Dockerfile',
      'FROM python:3.11-slim\nWORKDIR /app\nCOPY app.py .\nCMD ["python", "app.py"]\n'
    );
    vfs.writeFile('/home/user/app/app.py', 'print("hello")');

    const res = simulateDockerBuild(vfs, '/home/user/app/Dockerfile', { tag: 'my-optimized-app:1.0' });
    expect(res.success).toBe(true);
  });
});
