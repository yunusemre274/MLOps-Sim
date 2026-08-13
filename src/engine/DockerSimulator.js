/**
 * DockerSimulator.js — Docker build/run & CLI tam simülatörü (Round 6)
 *
 * Dockerfile parser AST'sinden gerçekçi build log'ları üretir.
 * Tüm Docker CLI komutları (container, image, volume, network, system, cp, stats, top, inspect)
 * için TEK ÇEKİRDEK HANDLER mimarisi sunar.
 *
 * KURAL: Her Docker komutu kavramsal olarak tek bir handler'a sahiptir.
 */

import { parseDockerfile } from './DockerfileParser.js';

// Bilinen base image'lar
const KNOWN_IMAGES = new Set([
  'python', 'node', 'alpine', 'ubuntu', 'debian', 'golang', 'rust',
  'nginx', 'redis', 'postgres', 'mysql', 'mongo', 'httpd',
  'openjdk', 'ruby', 'php', 'busybox', 'scratch',
]);

// === GÖREV 1: BASE IMAGE YETENEK MODELİ ===
export const BASE_IMAGE_CAPABILITIES = {
  'python:3.11': {
    binaries: ['python', 'python3', 'pip', 'pip3', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'pip',
    hasApt: true,
    osFamily: 'debian',
  },
  'python:3.11-slim': {
    binaries: ['python', 'python3', 'pip', 'pip3', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'pip',
    hasApt: true,
    osFamily: 'debian',
  },
  'python:3.10': {
    binaries: ['python', 'python3', 'pip', 'pip3', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'pip',
    hasApt: true,
    osFamily: 'debian',
  },
  'python:3.10-slim': {
    binaries: ['python', 'python3', 'pip', 'pip3', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'pip',
    hasApt: true,
    osFamily: 'debian',
  },
  'python:alpine': {
    binaries: ['python', 'python3', 'pip', 'pip3', 'sh', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'pip',
    hasApt: false,
    osFamily: 'alpine',
  },
  'node:20': {
    binaries: ['node', 'npm', 'npx', 'yarn', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'npm',
    hasApt: true,
    osFamily: 'debian',
  },
  'node:20-alpine': {
    binaries: ['node', 'npm', 'npx', 'yarn', 'sh', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'npm',
    hasApt: false,
    osFamily: 'alpine',
  },
  'node:18': {
    binaries: ['node', 'npm', 'npx', 'yarn', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'npm',
    hasApt: true,
    osFamily: 'debian',
  },
  'node:18-alpine': {
    binaries: ['node', 'npm', 'npx', 'yarn', 'sh', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'npm',
    hasApt: false,
    osFamily: 'alpine',
  },
  'golang:1.22': {
    binaries: ['go', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'go mod',
    hasApt: true,
    osFamily: 'debian',
  },
  'golang:1.21': {
    binaries: ['go', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'go mod',
    hasApt: true,
    osFamily: 'debian',
  },
  'golang:alpine': {
    binaries: ['go', 'sh', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'go mod',
    hasApt: false,
    osFamily: 'alpine',
  },
  'nginx:alpine': {
    binaries: ['nginx', 'sh', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: null,
    hasApt: false,
    osFamily: 'alpine',
  },
  'nginx:latest': {
    binaries: ['nginx', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: null,
    hasApt: true,
    osFamily: 'debian',
  },
  'alpine:latest': {
    binaries: ['apk', 'sh', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'apk',
    hasApt: false,
    osFamily: 'alpine',
  },
  'alpine': {
    binaries: ['apk', 'sh', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'apk',
    hasApt: false,
    osFamily: 'alpine',
  },
  'ubuntu:latest': {
    binaries: ['apt-get', 'apt', 'dpkg', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'apt-get',
    hasApt: true,
    osFamily: 'debian',
  },
  'ubuntu': {
    binaries: ['apt-get', 'apt', 'dpkg', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'apt-get',
    hasApt: true,
    osFamily: 'debian',
  },
  'debian:latest': {
    binaries: ['apt-get', 'apt', 'dpkg', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'apt-get',
    hasApt: true,
    osFamily: 'debian',
  },
  'debian:bullseye-slim': {
    binaries: ['apt-get', 'apt', 'dpkg', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: 'apt-get',
    hasApt: true,
    osFamily: 'debian',
  },
  'redis:alpine': {
    binaries: ['redis-server', 'redis-cli', 'sh', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: null,
    hasApt: false,
    osFamily: 'alpine',
  },
  'postgres:15': {
    binaries: ['postgres', 'psql', 'sh', 'bash', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: null,
    hasApt: true,
    osFamily: 'debian',
  },
};

export function getBaseImageCapabilities(baseImage, tag = 'latest') {
  const fullKey = `${baseImage}:${tag}`;
  if (BASE_IMAGE_CAPABILITIES[fullKey]) {
    return {
      binaries: [...BASE_IMAGE_CAPABILITIES[fullKey].binaries],
      packageManager: BASE_IMAGE_CAPABILITIES[fullKey].packageManager,
      hasApt: BASE_IMAGE_CAPABILITIES[fullKey].hasApt,
      osFamily: BASE_IMAGE_CAPABILITIES[fullKey].osFamily,
    };
  }
  if (BASE_IMAGE_CAPABILITIES[baseImage]) {
    return {
      binaries: [...BASE_IMAGE_CAPABILITIES[baseImage].binaries],
      packageManager: BASE_IMAGE_CAPABILITIES[baseImage].packageManager,
      hasApt: BASE_IMAGE_CAPABILITIES[baseImage].hasApt,
      osFamily: BASE_IMAGE_CAPABILITIES[baseImage].osFamily,
    };
  }
  return {
    binaries: ['sh', 'cat', 'ls', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'chmod'],
    packageManager: null,
    hasApt: true,
    osFamily: 'debian',
  };
}

/**
 * Dockerfile AST'sinden gerçekçi build log satırları üretir.
 *
 * 4 Katmanlı Doğrulama + Round 8 Base Image Yetenek ve Komut Doğrulaması:
 * Katman 1: Sözdizimi hataları (ast.errors)
 * Katman 2: Semantik kontroller (Base image, VFS build context dosya kontrolü, stage isimleri)
 * Katman 2.5 (Round 8): Base image yetenek modeli & komut sözdizimi doğrulaması
 */
export function generateBuildLogs(ast, vfs = null, contextDir = '/home/user', targetTag = 'app:latest') {
  const logs = [];
  const errors = [];
  let stepCount = 0;

  // Katman 1: Sözdizimi Doğrulama
  if (ast.errors.length > 0) {
    for (const err of ast.errors) {
      errors.push(err.message);
      logs.push(`\x1b[31mERROR\x1b[0m: ${err.message}`);
    }
    return { logs, success: false, errors, imageId: null };
  }

  logs.push('Sending build context to Docker daemon  2.048kB');
  logs.push('');

  const previousStageNames = new Set();
  const stageCapabilities = {};
  let currentCaps = null;

  for (let si = 0; si < ast.stages.length; si++) {
    const stage = ast.stages[si];
    const stageName = stage.name ? ` (${stage.name})` : '';

    stepCount++;
    logs.push(`Step ${stepCount}/${countTotalSteps(ast)} : FROM ${stage.baseImage}:${stage.tag}${stageName}`);

    // Katman 2: Base Image Doğrulama
    if (!KNOWN_IMAGES.has(stage.baseImage) && !images[`${stage.baseImage}:${stage.tag}`] && !images[stage.baseImage]) {
      logs.push(` ---> Pulling from library/${stage.baseImage}`);
      logs.push(`\x1b[31mERROR\x1b[0m: Error response from daemon: pull access denied for ${stage.baseImage}, repository does not exist or may require 'docker login'`);
      errors.push(`Base image bulunamadı: ${stage.baseImage}:${stage.tag}`);
      return { logs, success: false, errors, imageId: null };
    }

    logs.push(` ---> Pulling from library/${stage.baseImage}`);
    logs.push(`${stage.tag}: Pulling from library/${stage.baseImage}`);
    logs.push(`Digest: sha256:${randomHex(12)}`);
    logs.push(`Status: Downloaded newer image for ${stage.baseImage}:${stage.tag}`);
    logs.push(` ---> ${randomHex(6)}`);
    logs.push('');

    // Çok aşamalı build: Her FROM aşaması kendi yetenek setine sahiptir!
    currentCaps = getBaseImageCapabilities(stage.baseImage, stage.tag);
    if (stage.name) {
      previousStageNames.add(stage.name);
      stageCapabilities[stage.name] = currentCaps;
    }
    stageCapabilities[`stage_${si}`] = currentCaps;

    for (const instr of stage.instructions) {
      stepCount++;
      logs.push(`Step ${stepCount}/${countTotalSteps(ast)} : ${instr.directive} ${instr.args}`);

      // Katman 2: COPY / ADD VFS Build Context Semantik Doğrulama
      if ((instr.directive === 'COPY' || instr.directive === 'ADD') && vfs) {
        const { sources, fromStage } = instr.parsed;

        if (fromStage) {
          if (!previousStageNames.has(fromStage)) {
            logs.push(`\x1b[31mERROR\x1b[0m: invalid from flag: stage ${fromStage} does not exist`);
            errors.push(`invalid from flag: stage ${fromStage} does not exist`);
            return { logs, success: false, errors, imageId: null };
          }
          // Multi-stage COPY: Eğer bir executable taşınıyorsa hedef stage binaries listesine ekle
          if (sources && sources.length > 0) {
            for (const s of sources) {
              const baseName = s.split('/').pop();
              if (baseName && !baseName.includes('.')) {
                currentCaps.binaries.push(baseName);
              }
            }
          }
        } else if (sources && sources.length > 0) {
          for (const src of sources) {
            if (src === '.' || src === './') continue;
            const fullPath = `${contextDir}/${src}`.replace(/\/+/g, '/');
            const fileCheck = vfs.cat(fullPath);
            const dirCheck = vfs.ls(fullPath);
            if (!fileCheck.success && !dirCheck.success) {
              logs.push(`\x1b[31mERROR\x1b[0m: COPY failed: file not found in build context: ${src}`);
              errors.push(`COPY failed: file not found in build context: ${src}`);
              return { logs, success: false, errors, imageId: null };
            }
          }
        }
      }

      switch (instr.directive) {
        case 'RUN':
          logs.push(` ---> Running in ${randomHex(6)}`);
          if (instr.parsed.commands) {
            for (const cmd of instr.parsed.commands) {
              const runSim = validateAndSimulateRunCommand(cmd, currentCaps, vfs, contextDir);
              if (!runSim.success) {
                for (const line of runSim.logs) {
                  logs.push(`\x1b[31m${line}\x1b[0m`);
                }
                logs.push(`\x1b[31mERROR\x1b[0m: The command '/bin/sh -c ${cmd}' returned a non-zero code: 127`);
                errors.push(runSim.error);
                return { logs, success: false, errors, imageId: null };
              }
              logs.push(...runSim.logs);
            }
          }
          logs.push(`Removing intermediate container ${randomHex(6)}`);
          logs.push(` ---> ${randomHex(6)}`);
          break;

        case 'COPY':
        case 'ADD':
        case 'WORKDIR':
        case 'EXPOSE':
        case 'ENV':
        case 'ARG':
        case 'LABEL':
        case 'USER':
        case 'CMD':
        case 'ENTRYPOINT':
        case 'HEALTHCHECK':
        case 'VOLUME':
        case 'SHELL':
        case 'STOPSIGNAL':
        default:
          logs.push(` ---> ${randomHex(6)}`);
          break;
      }
      logs.push('');
    }
  }

  const imageId = randomHex(6);
  logs.push(`Successfully built ${imageId}`);
  logs.push(`Successfully tagged ${targetTag}`);

  // Bildirilen image'ı yerel image listesine ekle
  const [repo, tag] = targetTag.includes(':') ? targetTag.split(':') : [targetTag, 'latest'];
  images[targetTag] = {
    id: imageId,
    repository: repo,
    tag: tag || 'latest',
    size: '125MB',
    created: 'Just now',
    ast,
    capabilities: currentCaps,
  };
  if (repo !== targetTag) {
    images[repo] = images[targetTag];
  }

  return { logs, success: true, errors: [], imageId };
}

// === GÖREV 2: YAYGIN KOMUT SÖZDİZİMİ DOĞRULAYICISI ===

export function validateAndSimulateRunCommand(cmd, currentCaps, vfs = null, contextDir = '/home/user') {
  const trimmed = cmd.trim();
  const lines = [];

  // İlk binary kelimesini bul (çevresel değişkenleri atla: FOO=BAR cmd)
  const tokens = trimmed.split(/\s+/);
  let binaryIdx = 0;
  while (binaryIdx < tokens.length && tokens[binaryIdx].includes('=')) {
    binaryIdx++;
  }
  if (tokens[binaryIdx] === 'sudo' || tokens[binaryIdx] === 'exec') {
    binaryIdx++;
  }
  const binary = tokens[binaryIdx] || '';

  // 1. Base Image Yetenek Kontrolü (GÖREV 1)
  if (binary === 'apt-get' || binary === 'apt') {
    if (!currentCaps.hasApt) {
      return {
        success: false,
        logs: ['/bin/sh: 1: apt-get: not found'],
        error: 'apt-get: not found (Base image does not support apt)',
      };
    }
  } else if (binary === 'apk') {
    if (currentCaps.osFamily !== 'alpine') {
      return {
        success: false,
        logs: ['/bin/sh: 1: apk: not found'],
        error: 'apk: not found (Base image is not alpine)',
      };
    }
  } else if (binary && !currentCaps.binaries.includes(binary)) {
    return {
      success: false,
      logs: [`/bin/sh: 1: ${binary}: not found`],
      error: `${binary}: not found in base image`,
    };
  }

  // 2. Özel Komut Sözdizimi Doğrulaması (GÖREV 2)

  // PIP / PIP3
  if (binary === 'pip' || binary === 'pip3') {
    if (tokens.includes('install')) {
      const installArgs = tokens.slice(tokens.indexOf('install') + 1);
      const hasRFlag = installArgs.includes('-r') || installArgs.includes('--requirement');

      // pip install requirements.txt (-r bayrağı unutulmuş)
      const txtArg = installArgs.find((a) => (a.endsWith('.txt') || a.endsWith('.pip')) && !a.startsWith('-'));
      if (txtArg && !hasRFlag) {
        return {
          success: false,
          logs: [
            `Collecting ${txtArg}`,
            `  ERROR: Could not find a version that satisfies the requirement ${txtArg} (from versions: none)`,
            `ERROR: No matching distribution found for ${txtArg}`,
          ],
          error: `pip install error: No matching distribution found for ${txtArg} (missing -r flag)`,
        };
      }

      // pip install -r <file>
      if (hasRFlag) {
        const rIdx = installArgs.findIndex((a) => a === '-r' || a === '--requirement');
        const reqFile = installArgs[rIdx + 1] || 'requirements.txt';

        if (vfs) {
          const reqPath = `${contextDir}/${reqFile}`.replace(/\/+/g, '/');
          const fileRes = vfs.cat(reqPath);
          if (!fileRes.success) {
            return {
              success: false,
              logs: [
                `ERROR: Could not open requirements file: [Errno 2] No such file or directory: '${reqFile}'`,
              ],
              error: `Could not open requirements file: ${reqFile}`,
            };
          }

          // requirements.txt içeriğini satır satır simüle et
          const packages = fileRes.content
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l && !l.startsWith('#'))
            .map((l) => l.split(/[=<>~]/)[0].trim());

          for (const pkg of packages) {
            lines.push(`Collecting ${pkg}`);
            lines.push(`  Downloading ${pkg}-1.0.0-py3-none-any.whl (42 kB)`);
            currentCaps.binaries.push(pkg);
          }
          if (packages.length > 0) {
            lines.push('Installing collected packages: ' + packages.join(', '));
            lines.push('Successfully installed ' + packages.map((p) => `${p}-1.0.0`).join(' '));
          } else {
            lines.push('Successfully installed requirements');
          }
          return { success: true, logs: lines };
        }
      }

      // Standart paket kurulumu (pip install flask fastapi vb.)
      const packages = installArgs.filter((p) => !p.startsWith('-'));
      for (const pkg of packages) {
        lines.push(`Collecting ${pkg}`);
        lines.push(`  Downloading ${pkg}-1.0.0-py3-none-any.whl (42 kB)`);
        currentCaps.binaries.push(pkg);
      }
      if (packages.length > 0) {
        lines.push('Installing collected packages: ' + packages.join(', '));
        lines.push('Successfully installed ' + packages.map((p) => `${p}-1.0.0`).join(' '));
      }
      return { success: true, logs: lines };
    }
  }

  // NPM
  if (binary === 'npm') {
    if (tokens.includes('install') || tokens.includes('i') || tokens.includes('ci')) {
      const isCi = tokens.includes('ci');
      const npmArgs = tokens.slice(tokens.indexOf(isCi ? 'ci' : (tokens.includes('install') ? 'install' : 'i')) + 1);
      const specificPackages = npmArgs.filter((a) => !a.startsWith('-'));

      if (specificPackages.length === 0 && vfs) {
        const pkgJsonPath = `${contextDir}/package.json`.replace(/\/+/g, '/');
        const pkgRes = vfs.cat(pkgJsonPath);
        if (!pkgRes.success) {
          return {
            success: false,
            logs: [
              'npm ERR! code ENOENT',
              'npm ERR! syscall open',
              'npm ERR! path /app/package.json',
              'npm ERR! errno -2',
              "npm ERR! enoent ENOENT: no such file or directory, open '/app/package.json'",
            ],
            error: 'npm install failed: package.json not found in build context',
          };
        }

        if (isCi) {
          const lockPath = `${contextDir}/package-lock.json`.replace(/\/+/g, '/');
          if (!vfs.cat(lockPath).success) {
            return {
              success: false,
              logs: [
                'npm ERR! The npm ci command can only install with an existing package-lock.json',
              ],
              error: 'npm ci failed: package-lock.json not found',
            };
          }
        }
      }

      lines.push('npm warn deprecated some-package@1.0.0');
      lines.push('added 142 packages in 8s');
      return { success: true, logs: lines };
    }
  }

  // GO
  if (binary === 'go') {
    if (tokens.includes('build') || (tokens.includes('mod') && tokens.includes('download'))) {
      if (vfs) {
        const goModPath = `${contextDir}/go.mod`.replace(/\/+/g, '/');
        if (!vfs.cat(goModPath).success) {
          return {
            success: false,
            logs: [
              "go: go.mod file not found in current directory or any parent directory; see 'go help modules'",
            ],
            error: 'go: go.mod file not found',
          };
        }
      }
      // -o bayrağı ile executable oluşturulduysa
      const oIdx = tokens.indexOf('-o');
      if (oIdx !== -1 && tokens[oIdx + 1]) {
        currentCaps.binaries.push(tokens[oIdx + 1]);
      }
      lines.push('+ go build finished successfully');
      return { success: true, logs: lines };
    }
  }

  // APT-GET / APT
  if (binary === 'apt-get' || binary === 'apt') {
    if (tokens.includes('update')) {
      lines.push('Get:1 http://deb.debian.org/debian bookworm InRelease [151 kB]');
      lines.push('Get:2 http://deb.debian.org/debian bookworm-updates InRelease [55.4 kB]');
      lines.push('Fetched 206 kB in 1s (210 kB/s)');
      lines.push('Reading package lists... Done');
    }
    if (tokens.includes('install')) {
      lines.push('Reading package lists...');
      lines.push('Building dependency tree...');
      lines.push('The following NEW packages will be installed:');
      const pkgs = tokens.slice(tokens.indexOf('install') + 1).filter((p) => !p.startsWith('-'));
      for (const p of pkgs) {
        currentCaps.binaries.push(p);
      }
      lines.push('0 upgraded, ' + pkgs.length + ' newly installed, 0 to remove.');
      lines.push('Setting up packages...');
    }
    return { success: true, logs: lines.length > 0 ? lines : ['+ ' + trimmed] };
  }

  // APK
  if (binary === 'apk') {
    if (tokens.includes('add')) {
      lines.push('fetch https://dl-cdn.alpinelinux.org/alpine/v3.18/main/');
      const pkgs = tokens.slice(tokens.indexOf('add') + 1).filter((p) => !p.startsWith('-'));
      for (const p of pkgs) {
        currentCaps.binaries.push(p);
        if (p.startsWith('py3-')) {
          currentCaps.binaries.push(p.replace('py3-', ''));
        }
      }
      lines.push(`OK: 15 MiB in ${pkgs.length + 10} packages`);
    }
    return { success: true, logs: lines.length > 0 ? lines : ['+ ' + trimmed] };
  }

  // Genel komut
  lines.push(`+ ${trimmed}`);
  return { success: true, logs: lines };
}

// State Saklayıcılar
let containers = {};
let images = {
  'app:latest': {
    id: 'a1b2c3d4e5f6',
    repository: 'app',
    tag: 'latest',
    size: '125MB',
    created: '2 hours ago',
    capabilities: BASE_IMAGE_CAPABILITIES['python:3.11-slim'],
  },
  'python:3.11-slim': {
    id: 'f6e5d4c3b2a1',
    repository: 'python',
    tag: '3.11-slim',
    size: '150MB',
    created: '3 days ago',
    capabilities: BASE_IMAGE_CAPABILITIES['python:3.11-slim'],
  },
};
let networks = {
  'bridge': { id: 'net_bridge', name: 'bridge', driver: 'bridge', scope: 'local', subnet: '172.17.0.0/16' },
};
let volumes = {
  'app_data': { name: 'app_data', driver: 'local', mountpoint: '/var/lib/docker/volumes/app_data/_data' },
};
let containerIdCounter = 1;

// === CONTAINER HANDLERS (GÖREV 3 RUNTIME DOĞRULAMA İLE) ===

export function dockerRun(imageNameOrArgs, options = {}) {
  let imageName = imageNameOrArgs;
  let opts = { ...options };

  if (Array.isArray(imageNameOrArgs)) {
    const args = imageNameOrArgs;
    imageName = args.find((a) => !a.startsWith('-')) || 'app:latest';
    const portIdx = args.indexOf('-p');
    let port = 8080;
    if (portIdx !== -1 && args[portIdx + 1]) {
      const portMap = args[portIdx + 1].split(':');
      port = parseInt(portMap[0]) || 8080;
    }
    const nameIdx = args.indexOf('--name');
    const name = nameIdx !== -1 ? args[nameIdx + 1] : undefined;
    opts = { port, name, ...opts };
  }

  if (typeof imageName !== 'string') {
    imageName = 'app:latest';
  }

  const imgObj = images[imageName] || images[`${imageName}:latest`];
  let caps = imgObj?.capabilities;
  if (!caps) {
    const parts = imageName.split(':');
    caps = getBaseImageCapabilities(parts[0], parts[1] || 'latest');
  }

  // GÖREV 3: Runtime CMD/ENTRYPOINT Executable Doğrulaması
  if (imgObj?.ast) {
    const lastStage = imgObj.ast.stages[imgObj.ast.stages.length - 1];
    const cmdInstr = lastStage?.instructions.find((i) => i.directive === 'CMD' || i.directive === 'ENTRYPOINT');
    if (cmdInstr) {
      let executable = null;
      if (cmdInstr.parsed.values && cmdInstr.parsed.values.length > 0) {
        executable = cmdInstr.parsed.values[0];
      } else if (typeof cmdInstr.args === 'string') {
        executable = cmdInstr.args.replace(/[\[\]"',]/g, ' ').trim().split(/\s+/)[0];
      }

      if (executable && !executable.startsWith('./') && !executable.startsWith('/') && !caps.binaries.includes(executable)) {
        return {
          success: false,
          containerId: null,
          message: `docker: Error response from daemon: OCI runtime create failed: container_linux.go: exec: "${executable}": executable file not found in $PATH: unknown.`,
        };
      }
    }
  }

  const id = `c${containerIdCounter++}_${randomHex(6)}`;
  const port = opts.port || 8080;
  const name = opts.name || id;

  containers[id] = {
    id,
    name,
    image: imageName,
    status: 'running',
    port,
    env: options.env || {},
    network: options.network || 'bridge',
    volume: options.volume || null,
    files: {
      'app.py': 'print("Docker Container Running")',
      'config.json': '{"env": "production"}',
    },
    logs: [
      `[${new Date().toISOString()}] Starting ${imageName}...`,
      `[${new Date().toISOString()}] Server listening on port ${port}`,
      `[${new Date().toISOString()}] Application started successfully.`,
    ],
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    containerId: id,
    message: `Container ${name} (${id.substring(0, 12)}) started on port ${port}`,
    port,
  };
}

export function dockerStop(containerId) {
  const found = Object.values(containers).find((c) => c.id === containerId || c.name === containerId);
  if (!found) {
    return { success: false, message: `Error: No such container: ${containerId}` };
  }
  found.status = 'stopped';
  found.logs.push(`[${new Date().toISOString()}] Received SIGTERM, shutting down.`);
  return { success: true, message: `Container ${found.name} (${found.id.substring(0, 12)}) stopped.` };
}

export function dockerStart(containerId) {
  const found = Object.values(containers).find((c) => c.id === containerId || c.name === containerId);
  if (!found) {
    return { success: false, message: `Error: No such container: ${containerId}` };
  }
  found.status = 'running';
  found.logs.push(`[${new Date().toISOString()}] Container restarted.`);
  return { success: true, message: `Container ${found.name} (${found.id.substring(0, 12)}) started.` };
}

export function dockerRestart(containerId) {
  dockerStop(containerId);
  return dockerStart(containerId);
}

export function dockerRm(containerId) {
  const found = Object.values(containers).find((c) => c.id === containerId || c.name === containerId);
  if (!found) {
    return { success: false, message: `Error: No such container: ${containerId}` };
  }
  delete containers[found.id];
  return { success: true, message: `Container ${containerId} removed.` };
}

export function dockerRename(oldName, newName) {
  const found = Object.values(containers).find((c) => c.id === oldName || c.name === oldName);
  if (!found) {
    return { success: false, message: `Error: No such container: ${oldName}` };
  }
  found.name = newName;
  return { success: true, message: `Renamed container ${oldName} to ${newName}` };
}

export function dockerPs() {
  return Object.values(containers).filter((c) => c.status === 'running');
}

export function dockerPsAll() {
  return Object.values(containers);
}

export function dockerLogs(containerId) {
  const found = Object.values(containers).find((c) => c.id === containerId || c.name === containerId);
  if (!found) return [`Error: No such container: ${containerId}`];
  return found.logs;
}

export function dockerExec(containerId, cmdString = '') {
  const found = Object.values(containers).find((c) => c.id === containerId || c.name === containerId);
  if (!found) return [`Error: No such container: ${containerId}`];

  if (cmdString.includes('ls')) {
    return Object.keys(found.files);
  }
  if (cmdString.includes('pwd')) {
    return ['/app'];
  }
  if (cmdString.includes('whoami')) {
    return ['root'];
  }
  return [`Executing '${cmdString}' in container ${found.name}... OK`];
}

export function dockerInspectContainer(containerId) {
  const found = Object.values(containers).find((c) => c.id === containerId || c.name === containerId);
  if (!found) return [`Error: No such container: ${containerId}`];

  const inspectObj = [
    {
      Id: found.id,
      Created: found.createdAt,
      Path: 'python',
      Args: ['app.py'],
      State: {
        Status: found.status,
        Running: found.status === 'running',
        Pid: found.status === 'running' ? 1042 : 0,
        ExitCode: 0,
      },
      Image: found.image,
      Name: `/${found.name}`,
      HostConfig: {
        PortBindings: { [`${found.port}/tcp`]: [{ HostIp: '0.0.0.0', HostPort: `${found.port}` }] },
      },
      Config: {
        Hostname: found.id.substring(0, 12),
        Env: Object.entries(found.env).map(([k, v]) => `${k}=${v}`),
        ExposedPorts: { [`${found.port}/tcp`]: {} },
      },
      NetworkSettings: {
        Networks: {
          [found.network]: {
            IPAddress: '172.17.0.2',
            Gateway: '172.17.0.1',
            MacAddress: '02:42:ac:11:00:02',
          },
        },
      },
      Mounts: found.volume ? [{ Name: found.volume, Destination: '/data', Driver: 'local' }] : [],
    },
  ];

  return JSON.stringify(inspectObj, null, 2).split('\n');
}

export function dockerPruneContainers() {
  const stopped = Object.values(containers).filter((c) => c.status === 'stopped');
  const count = stopped.length;
  stopped.forEach((c) => delete containers[c.id]);

  return [
    'Deleted Containers:',
    ...stopped.map((c) => c.id),
    '',
    `Total reclaimed space: ${count * 14.2}MB`,
  ];
}

export function dockerTop(containerId) {
  const found = Object.values(containers).find((c) => c.id === containerId || c.name === containerId);
  if (!found) return [`Error: No such container: ${containerId}`];

  return [
    'PID    USER    TIME    COMMAND',
    `1042   root    0:02    python app.py`,
    `1088   root    0:00    {python} worker`,
  ];
}

export function dockerCp(vfs, source, target) {
  // Format: container:path -> hostPath  VEYA  hostPath -> container:path
  if (source.includes(':')) {
    const [cName, cPath] = source.split(':');
    const found = Object.values(containers).find((c) => c.id === cName || c.name === cName);
    if (!found) return [`Error: No such container: ${cName}`];

    const fileName = cPath.split('/').pop() || 'file.txt';
    const content = found.files[fileName] || `# Copied from container ${found.name}\nDATA=1\n`;
    vfs.touch(target);
    vfs.writeFile(target, content);
    return [`Successfully copied 2.04kB from ${cName}:${cPath} to ${target}`];
  }

  if (target.includes(':')) {
    const [cName, cPath] = target.split(':');
    const found = Object.values(containers).find((c) => c.id === cName || c.name === cName);
    if (!found) return [`Error: No such container: ${cName}`];

    const catRes = vfs.cat(source);
    const fileName = cPath.split('/').pop() || source.split('/').pop();
    found.files[fileName] = catRes.success ? catRes.content : 'Copied file';
    return [`Successfully copied 2.04kB from ${source} to ${cName}:${cPath}`];
  }

  return ['Usage: docker cp <container>:<path> <host-path> OR docker cp <host-path> <container>:<path>'];
}

// === IMAGE HANDLERS ===

export function dockerImages() {
  return Object.values(images);
}

export function dockerRmi(imageId) {
  const key = Object.keys(images).find((k) => k === imageId || images[k].id === imageId || images[k].repository === imageId);
  if (key) {
    delete images[key];
    return { success: true, message: `Untagged: ${key}` };
  }
  return { success: false, message: `Error: No such image: ${imageId}` };
}

export function dockerImageInspect(imageId) {
  const key = Object.keys(images).find((k) => k === imageId || images[k].id === imageId || images[k].repository === imageId);
  if (!key) return [`Error: No such image: ${imageId}`];
  const img = images[key];

  const inspectObj = [
    {
      Id: `sha256:${img.id}`,
      RepoTags: [key],
      Created: img.created || new Date().toISOString(),
      Size: img.size,
      Architecture: 'amd64',
      Os: 'linux',
      RootFS: { Type: 'layers', Layers: [`sha256:${randomHex(12)}`, `sha256:${randomHex(12)}`] },
    },
  ];
  return JSON.stringify(inspectObj, null, 2).split('\n');
}

export function dockerImagePrune() {
  const usedImages = new Set(Object.values(containers).map((c) => c.image));
  const unused = Object.keys(images).filter((k) => !usedImages.has(k) && !usedImages.has(images[k].repository));

  const count = unused.length;
  unused.forEach((k) => delete images[k]);

  return [
    'Deleted Images:',
    ...unused.map((k) => images[k]?.id || k),
    '',
    `Total reclaimed space: ${count * 85.5}MB`,
  ];
}

export function dockerImageHistory(imageId) {
  const key = Object.keys(images).find((k) => k === imageId || images[k].id === imageId || images[k].repository === imageId);
  if (!key) return [`Error: No such image: ${imageId}`];

  return [
    'IMAGE          CREATED        CREATED BY                                      SIZE',
    `${randomHex(6)}   2 hours ago    /bin/sh -c #(nop) CMD ["python","app.py"]       0B`,
    `${randomHex(6)}   2 hours ago    /bin/sh -c pip install -r requirements.txt      24.5MB`,
    `${randomHex(6)}   2 hours ago    /bin/sh -c #(nop) COPY file:a1b2 in /app        1.2MB`,
    `${randomHex(6)}   2 hours ago    /bin/sh -c #(nop) WORKDIR /app                  0B`,
    `${randomHex(6)}   3 days ago     /bin/sh -c #(nop) FROM python:3.11-slim         120MB`,
  ];
}

export function dockerPull(imageName) {
  const base = imageName.split(':')[0];
  const tag = imageName.split(':')[1] || 'latest';
  const fullName = `${base}:${tag}`;

  if (!KNOWN_IMAGES.has(base)) {
    return [
      `Using default tag: ${tag}`,
      `Error response from daemon: pull access denied for ${base}, repository does not exist or may require 'docker login'`,
    ];
  }

  images[fullName] = {
    id: randomHex(12),
    repository: base,
    tag,
    size: '145MB',
    created: 'Just now',
  };

  return [
    `Using default tag: ${tag}`,
    `${tag}: Pulling from library/${base}`,
    `a3ed95ca0b: Pull complete`,
    `b2c1d3e4f5: Pull complete`,
    `Digest: sha256:${randomHex(16)}`,
    `Status: Downloaded newer image for ${fullName}`,
  ];
}

export function dockerPush(imageName) {
  return [
    `The push refers to repository [docker.io/library/${imageName}]`,
    `a3ed95ca0b: Pushed`,
    `b2c1d3e4f5: Pushed`,
    `latest: digest: sha256:${randomHex(16)} size: 1572`,
  ];
}

export function dockerTag(srcImage, targetTag) {
  const found = Object.keys(images).find((k) => k === srcImage || images[k].id === srcImage || images[k].repository === srcImage);
  if (!found) return `Error: No such image: ${srcImage}`;

  images[targetTag] = { ...images[found], repository: targetTag.split(':')[0], tag: targetTag.split(':')[1] || 'latest' };
  return `Tagged ${srcImage} as ${targetTag}`;
}

// === VOLUME HANDLERS ===

export function dockerVolumeCreate(name) {
  volumes[name] = { name, driver: 'local', mountpoint: `/var/lib/docker/volumes/${name}/_data` };
  return `Volume ${name} created.`;
}

export function dockerVolumeLs() {
  return Object.values(volumes);
}

export function dockerVolumeRm(name) {
  if (!volumes[name]) return { success: false, message: `Error: No such volume: ${name}` };
  delete volumes[name];
  return { success: true, message: `Volume ${name} removed.` };
}

export function dockerVolumeInspect(name) {
  if (!volumes[name]) return [`Error: No such volume: ${name}`];
  const inspectObj = [
    {
      CreatedAt: new Date().toISOString(),
      Driver: volumes[name].driver || 'local',
      Labels: null,
      Mountpoint: volumes[name].mountpoint || `/var/lib/docker/volumes/${name}/_data`,
      Name: name,
      Options: null,
      Scope: 'local',
    },
  ];
  return JSON.stringify(inspectObj, null, 2).split('\n');
}

export function dockerVolumePrune() {
  const usedVolumes = new Set(Object.values(containers).map((c) => c.volume).filter(Boolean));
  const unused = Object.keys(volumes).filter((v) => !usedVolumes.has(v));
  const count = unused.length;
  unused.forEach((v) => delete volumes[v]);

  return [
    'Deleted Volumes:',
    ...unused,
    '',
    `Total reclaimed space: ${count * 12.0}MB`,
  ];
}

// === NETWORK HANDLERS ===

export function dockerNetworkCreate(name) {
  networks[name] = { id: `net_${randomHex(6)}`, name, driver: 'bridge', scope: 'local', subnet: '172.18.0.0/16' };
  return `Network ${name} created (${networks[name].id})`;
}

export function dockerNetworkLs() {
  return Object.values(networks);
}

export function dockerNetworkRm(name) {
  if (name === 'bridge') return { success: false, message: `Error: cannot remove predefined network bridge` };
  if (!networks[name]) return { success: false, message: `Error: No such network: ${name}` };
  delete networks[name];
  return { success: true, message: `Network ${name} removed.` };
}

export function dockerNetworkInspect(name) {
  if (!networks[name]) return [`Error: No such network: ${name}`];
  const net = networks[name];
  const connectedContainers = Object.values(containers).filter((c) => c.network === name);

  const containerMap = {};
  connectedContainers.forEach((c) => {
    containerMap[c.id] = { Name: c.name, EndpointID: randomHex(12), MacAddress: '02:42:ac:11:00:02', IPv4Address: '172.17.0.2/16' };
  });

  const inspectObj = [
    {
      Name: net.name,
      Id: net.id,
      Created: new Date().toISOString(),
      Scope: net.scope || 'local',
      Driver: net.driver || 'bridge',
      IPAM: { Config: [{ Subnet: net.subnet || '172.17.0.0/16', Gateway: '172.17.0.1' }] },
      Containers: containerMap,
    },
  ];
  return JSON.stringify(inspectObj, null, 2).split('\n');
}

export function dockerNetworkConnect(netName, containerId) {
  const found = Object.values(containers).find((c) => c.id === containerId || c.name === containerId);
  if (!found) return `Error: No such container: ${containerId}`;
  if (!networks[netName]) return `Error: No such network: ${netName}`;

  found.network = netName;
  return `Connected container ${found.name} to network ${netName}`;
}

export function dockerNetworkDisconnect(netName, containerId) {
  const found = Object.values(containers).find((c) => c.id === containerId || c.name === containerId);
  if (!found) return `Error: No such container: ${containerId}`;
  found.network = 'none';
  return `Disconnected container ${found.name} from network ${netName}`;
}

export function dockerNetworkPrune() {
  const usedNetworks = new Set(Object.values(containers).map((c) => c.network).filter(Boolean));
  usedNetworks.add('bridge');

  const unused = Object.keys(networks).filter((n) => !usedNetworks.has(n));
  unused.forEach((n) => delete networks[n]);

  return [
    'Deleted Networks:',
    ...unused,
  ];
}

// === SYSTEM & STATS HANDLERS ===

export function dockerSystemDf() {
  const activeContainers = Object.values(containers).filter((c) => c.status === 'running').length;
  const activeVolumes = Object.values(volumes).length;

  return [
    'TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE',
    `Images          ${Object.keys(images).length}         ${activeContainers}         275MB     125MB (45%)`,
    `Containers      ${Object.keys(containers).length}         ${activeContainers}         14.2MB    0B (0%)`,
    `Local Volumes   ${activeVolumes}         1         12.0MB    0B (0%)`,
    `Build Cache     4         0         45.0MB    45.0MB`,
  ];
}

export function dockerSystemPrune(options = {}) {
  const resC = dockerPruneContainers();
  const resI = dockerImagePrune();
  const resN = dockerNetworkPrune();
  const resV = options.all ? dockerVolumePrune() : [];

  return [
    'WARNING! This will remove:',
    '  - all stopped containers',
    '  - all networks not used by at least one container',
    '  - all dangling images',
    '',
    ...resC,
    ...resI,
    ...resN,
    ...resV,
    'Total reclaimed space: 147.7MB',
  ];
}

export function dockerStats() {
  const running = Object.values(containers).filter((c) => c.status === 'running');
  if (running.length === 0) {
    return ['CONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT     MEM %     NET I/O     BLOCK I/O   PIDS'];
  }

  const lines = ['CONTAINER ID   NAME           CPU %     MEM USAGE / LIMIT     MEM %     NET I/O       BLOCK I/O   PIDS'];
  for (const c of running) {
    const memMb = Math.floor(35 + Math.random() * 20);
    const cpuPct = (Math.random() * 1.5).toFixed(2);
    lines.push(
      `${c.id.substring(0, 12)}   ${c.name.padEnd(14)} ${cpuPct}%    ${memMb}MiB / 512MiB      ${(memMb / 5.12).toFixed(2)}%    1.2kB / 850B  0B / 0B     4`
    );
  }
  return lines;
}

// === HELP HANDLER ===

export function dockerHelp(group = null) {
  if (group === 'container') {
    return [
      'Usage:  docker container COMMAND',
      'Manage containers',
      '',
      'Commands:',
      '  run         Create and run a new container from an image',
      '  ls          List containers',
      '  stop        Stop one or more running containers',
      '  start       Start one or more stopped containers',
      '  restart     Restart one or more containers',
      '  rm          Remove one or more containers',
      '  logs        Fetch the logs of a container',
      '  exec        Run a command in a running container',
      '  inspect     Display detailed information on one or more containers',
      '  prune       Remove all stopped containers',
      '  top         Display the running processes of a container',
      '  rename      Rename a container',
      '  cp          Copy files/folders between a container and the local filesystem',
    ];
  }

  if (group === 'image') {
    return [
      'Usage:  docker image COMMAND',
      'Manage images',
      '',
      'Commands:',
      '  ls          List images',
      '  rm          Remove one or more images',
      '  inspect     Display detailed information on one or more images',
      '  history     Show the history of an image',
      '  prune       Remove unused images',
      '  pull        Download an image from a registry',
      '  push        Upload an image to a registry',
      '  tag         Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE',
    ];
  }

  if (group === 'volume') {
    return [
      'Usage:  docker volume COMMAND',
      'Manage volumes',
      '',
      'Commands:',
      '  create      Create a volume',
      '  ls          List volumes',
      '  rm          Remove one or more volumes',
      '  inspect     Display detailed information on one or more volumes',
      '  prune       Remove unused local volumes',
    ];
  }

  if (group === 'network') {
    return [
      'Usage:  docker network COMMAND',
      'Manage networks',
      '',
      'Commands:',
      '  create      Create a network',
      '  ls          List networks',
      '  rm          Remove one or more networks',
      '  inspect     Display detailed information on one or more networks',
      '  connect     Connect a container to a network',
      '  disconnect  Disconnect a container from a network',
      '  prune       Remove all unused networks',
    ];
  }

  if (group === 'system') {
    return [
      'Usage:  docker system COMMAND',
      'Manage Docker',
      '',
      'Commands:',
      '  df          Show docker disk usage',
      '  prune       Remove unused data',
    ];
  }

  return [
    'Usage:  docker [OPTIONS] COMMAND',
    'A self-sufficient runtime for containers',
    '',
    'Management Commands:',
    '  container   Manage containers (run, ls, stop, start, rm, logs, inspect, prune)',
    '  image       Manage images (ls, rm, inspect, history, prune, pull, push, tag)',
    '  volume      Manage volumes (create, ls, rm, inspect, prune)',
    '  network     Manage networks (create, ls, rm, inspect, connect, disconnect, prune)',
    '  system      Manage Docker (df, prune)',
    '',
    'Commands:',
    '  build       Build an image from a Dockerfile',
    '  run         Create and run a new container from an image',
    '  ps          List containers',
    '  stop        Stop one or more running containers',
    '  start       Start one or more stopped containers',
    '  rm          Remove one or more containers',
    '  rmi         Remove one or more images',
    '  images      List images',
    '  logs        Fetch the logs of a container',
    '  exec        Run a command in a running container',
    '  stats       Display a live stream of container(s) resource usage statistics',
    '  cp          Copy files/folders between a container and the local filesystem',
    '',
    "Run 'docker COMMAND --help' for more information on a command.",
  ];
}

export function resetContainers() {
  containers = {};
  containerIdCounter = 1;
}

export function simulateDockerBuild(vfs, dockerfilePath = 'Dockerfile', options = {}) {
  const result = vfs.cat(dockerfilePath);
  if (!result.success) {
    return {
      logs: [`\x1b[31mERROR\x1b[0m: ${dockerfilePath}: Dosya bulunamadı`],
      success: false,
      errors: [`${dockerfilePath} bulunamadı`],
      imageId: null,
    };
  }

  let contextDir = vfs.pwd();
  if (dockerfilePath.includes('/')) {
    const parts = dockerfilePath.split('/');
    parts.pop();
    contextDir = parts.join('/') || '/';
  }

  const { ast } = parseDockerfile(result.content);
  return generateBuildLogs(ast, vfs, contextDir, options.tag || 'app:latest');
}

function randomHex(len) {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function countTotalSteps(ast) {
  let count = 0;
  for (const stage of ast.stages) {
    count += 1 + stage.instructions.length;
  }
  return count;
}
