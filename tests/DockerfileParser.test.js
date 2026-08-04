/**
 * DockerfileParser.test.js — Dockerfile parser birim testleri
 */

import { describe, it, expect } from 'vitest';
import { tokenize, buildAST, parseDockerfile } from '../src/engine/DockerfileParser.js';

// === Tokenizer Testleri ===
describe('tokenize', () => {
  it('boş satırları tanımalı', () => {
    const tokens = tokenize('\n\n');
    expect(tokens.filter((t) => t.type === 'empty').length).toBeGreaterThanOrEqual(2);
  });

  it('yorum satırlarını tanımalı', () => {
    const tokens = tokenize('# Bu bir yorum\nFROM python:3.11');
    expect(tokens[0].type).toBe('comment');
    expect(tokens[0].args).toBe('Bu bir yorum');
  });

  it('FROM direktifini tanımalı', () => {
    const tokens = tokenize('FROM python:3.11');
    const directive = tokens.find((t) => t.type === 'directive');
    expect(directive).toBeDefined();
    expect(directive.directive).toBe('FROM');
    expect(directive.args).toBe('python:3.11');
  });

  it('bilinmeyen direktifi unknown olarak işaretlemeli', () => {
    const tokens = tokenize('FROM python:3.11\nBLAH test');
    const unknown = tokens.find((t) => t.type === 'unknown');
    expect(unknown).toBeDefined();
    expect(unknown.error).toContain('Bilinmeyen direktif');
  });

  it('backslash continuation birleştirmeli', () => {
    const tokens = tokenize('RUN apt-get update && \\\n    apt-get install -y curl');
    const run = tokens.find((t) => t.directive === 'RUN');
    expect(run.args).toContain('apt-get update');
    expect(run.args).toContain('apt-get install -y curl');
  });

  it('tüm geçerli direktifleri tanımalı', () => {
    const directives = ['FROM', 'RUN', 'COPY', 'WORKDIR', 'EXPOSE', 'CMD', 'USER', 'ENV', 'ARG', 'ENTRYPOINT', 'HEALTHCHECK', 'LABEL', 'ADD', 'VOLUME'];
    for (const d of directives) {
      const tokens = tokenize(`${d} test`);
      const found = tokens.find((t) => t.directive === d);
      expect(found, `${d} tanınmalı`).toBeDefined();
    }
  });
});

// === AST Builder Testleri ===
describe('buildAST', () => {
  it('FROM yoksa hata vermeli', () => {
    const tokens = tokenize('RUN echo hello');
    const ast = buildAST(tokens);
    expect(ast.errors.length).toBeGreaterThan(0);
    expect(ast.errors[0].message).toContain('FROM');
  });

  it('tek stage oluşturmalı', () => {
    const tokens = tokenize('FROM python:3.11\nRUN pip install flask');
    const ast = buildAST(tokens);
    expect(ast.stages.length).toBe(1);
    expect(ast.stages[0].baseImage).toBe('python');
    expect(ast.stages[0].tag).toBe('3.11');
    expect(ast.stages[0].instructions.length).toBe(1);
  });

  it('multi-stage build desteklemeli', () => {
    const content = 'FROM node:18 AS builder\nRUN npm ci\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html';
    const tokens = tokenize(content);
    const ast = buildAST(tokens);
    expect(ast.stages.length).toBe(2);
    expect(ast.stages[0].name).toBe('builder');
    expect(ast.stages[1].baseImage).toBe('nginx');
  });

  it('FROM ... AS alias parse etmeli', () => {
    const tokens = tokenize('FROM python:3.11 AS build-stage');
    const ast = buildAST(tokens);
    expect(ast.stages[0].name).toBe('build-stage');
    expect(ast.stages[0].baseImage).toBe('python');
    expect(ast.stages[0].tag).toBe('3.11');
  });

  it('tag belirtilmezse latest varsaymalı', () => {
    const tokens = tokenize('FROM ubuntu');
    const ast = buildAST(tokens);
    expect(ast.stages[0].tag).toBe('latest');
  });
});

// === Direktif Parse Testleri ===
describe('direktif parse', () => {
  it('RUN komutlarını && ile ayırmalı', () => {
    const { ast } = parseDockerfile('FROM alpine\nRUN apt-get update && apt-get install -y curl');
    const run = ast.stages[0].instructions[0];
    expect(run.parsed.commands.length).toBe(2);
    expect(run.parsed.commands[0]).toContain('apt-get update');
    expect(run.parsed.shell).toBe(true);
  });

  it('RUN JSON formatını parse etmeli', () => {
    const { ast } = parseDockerfile('FROM alpine\nRUN ["echo", "hello"]');
    const run = ast.stages[0].instructions[0];
    expect(run.parsed.commands).toEqual(['echo', 'hello']);
    expect(run.parsed.shell).toBe(false);
  });

  it('COPY source ve dest ayırmalı', () => {
    const { ast } = parseDockerfile('FROM alpine\nCOPY package.json .');
    const copy = ast.stages[0].instructions[0];
    expect(copy.parsed.sources).toEqual(['package.json']);
    expect(copy.parsed.dest).toBe('.');
  });

  it('COPY --from=stage desteklemeli', () => {
    const { ast } = parseDockerfile('FROM alpine\nCOPY --from=builder /app/dist /var/www');
    const copy = ast.stages[0].instructions[0];
    expect(copy.parsed.fromStage).toBe('builder');
    expect(copy.parsed.sources).toEqual(['/app/dist']);
    expect(copy.parsed.dest).toBe('/var/www');
  });

  it('EXPOSE portları parse etmeli', () => {
    const { ast } = parseDockerfile('FROM alpine\nEXPOSE 8080 3000');
    const expose = ast.stages[0].instructions[0];
    expect(expose.parsed.ports).toEqual([8080, 3000]);
  });

  it('ENV key=value parse etmeli', () => {
    const { ast } = parseDockerfile('FROM alpine\nENV NODE_ENV=production');
    const env = ast.stages[0].instructions[0];
    expect(env.parsed.key).toBe('NODE_ENV');
    expect(env.parsed.value).toBe('production');
  });

  it('ARG default value parse etmeli', () => {
    const { ast } = parseDockerfile('FROM alpine\nARG VERSION=1.0');
    const arg = ast.stages[0].instructions[0];
    expect(arg.parsed.key).toBe('VERSION');
    expect(arg.parsed.defaultValue).toBe('1.0');
  });

  it('ARG default value olmadan parse etmeli', () => {
    const { ast } = parseDockerfile('FROM alpine\nARG BUILD_NUMBER');
    const arg = ast.stages[0].instructions[0];
    expect(arg.parsed.key).toBe('BUILD_NUMBER');
    expect(arg.parsed.defaultValue).toBeNull();
  });

  it('CMD JSON formatını parse etmeli', () => {
    const { ast } = parseDockerfile('FROM alpine\nCMD ["python", "app.py"]');
    const cmd = ast.stages[0].instructions[0];
    expect(cmd.parsed.values).toEqual(['python', 'app.py']);
    expect(cmd.parsed.shell).toBe(false);
  });

  it('WORKDIR parse etmeli', () => {
    const { ast } = parseDockerfile('FROM alpine\nWORKDIR /app');
    const wd = ast.stages[0].instructions[0];
    expect(wd.parsed.workdir).toBe('/app');
  });
});

// === Full Pipeline Testleri ===
describe('parseDockerfile', () => {
  it('gerçekçi bir Dockerfile parse etmeli', () => {
    const content = `
# Python ML API
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
CMD ["python", "app.py"]
`;
    const { ast } = parseDockerfile(content);
    expect(ast.errors).toHaveLength(0);
    expect(ast.stages).toHaveLength(1);
    expect(ast.stages[0].baseImage).toBe('python');
    expect(ast.stages[0].tag).toBe('3.11-slim');
    expect(ast.stages[0].instructions.length).toBe(6);
  });

  it('multi-stage ML pipeline parse etmeli', () => {
    const content = `
FROM python:3.11 AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY . .
CMD ["gunicorn", "app:app"]
`;
    const { ast } = parseDockerfile(content);
    expect(ast.errors).toHaveLength(0);
    expect(ast.stages).toHaveLength(2);
    expect(ast.stages[0].name).toBe('builder');
    expect(ast.stages[1].name).toBeNull();
  });

  it('sözdizimi hatası raporlamalı', () => {
    const content = 'INVALIDCMD test\nFROM alpine';
    const { ast } = parseDockerfile(content);
    expect(ast.errors.length).toBeGreaterThan(0);
  });
});
