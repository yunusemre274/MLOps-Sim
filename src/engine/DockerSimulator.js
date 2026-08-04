/**
 * DockerSimulator.js — Docker build/run simülatörü
 *
 * Dockerfile parser AST'sinden gerçekçi build log'ları üretir.
 * Container state yönetimi (run, stop, ps) sağlar.
 *
 * KURAL: Gerçek Docker daemon asla çalıştırılmaz.
 */

import { parseDockerfile } from './DockerfileParser.js';

// Bilinen base image'lar — bunların dışındakiler "pull failed" hatası verir
const KNOWN_IMAGES = new Set([
  'python', 'node', 'alpine', 'ubuntu', 'debian', 'golang', 'rust',
  'nginx', 'redis', 'postgres', 'mysql', 'mongo', 'httpd',
  'openjdk', 'ruby', 'php', 'busybox', 'scratch',
]);

/**
 * Dockerfile AST'sinden gerçekçi build log satırları üretir.
 * @param {Object} ast - parseDockerfile().ast
 * @returns {{ logs: string[], success: boolean, errors: string[], imageId: string|null }}
 */
export function generateBuildLogs(ast) {
  const logs = [];
  const errors = [];
  let stepCount = 0;
  let success = true;

  // Parser hataları varsa build başarısız
  if (ast.errors.length > 0) {
    for (const err of ast.errors) {
      errors.push(`ERROR: Satır ${err.line}: ${err.message}`);
      logs.push(`\x1b[31mERROR\x1b[0m: Satır ${err.line}: ${err.message}`);
    }
    return { logs, success: false, errors, imageId: null };
  }

  logs.push('Sending build context to Docker daemon  2.048kB');
  logs.push('');

  for (let si = 0; si < ast.stages.length; si++) {
    const stage = ast.stages[si];
    const stageName = stage.name ? ` (${stage.name})` : '';

    // FROM — image pull simülasyonu
    stepCount++;
    logs.push(`Step ${stepCount}/${countTotalSteps(ast)} : FROM ${stage.baseImage}:${stage.tag}${stageName}`);

    // Bilinmeyen image kontrolü
    if (!KNOWN_IMAGES.has(stage.baseImage)) {
      logs.push(` ---> Pulling from library/${stage.baseImage}`);
      logs.push(`\x1b[31mERROR\x1b[0m: manifest for ${stage.baseImage}:${stage.tag} not found: manifest unknown`);
      errors.push(`Base image bulunamadı: ${stage.baseImage}:${stage.tag}`);
      return { logs, success: false, errors, imageId: null };
    }

    logs.push(` ---> Pulling from library/${stage.baseImage}`);
    logs.push(`${stage.tag}: Pulling from library/${stage.baseImage}`);
    logs.push(`Digest: sha256:${randomHex(12)}`);
    logs.push(`Status: Downloaded newer image for ${stage.baseImage}:${stage.tag}`);
    logs.push(` ---> ${randomHex(6)}`);
    logs.push('');

    // Komutları işle
    for (const instr of stage.instructions) {
      stepCount++;
      logs.push(`Step ${stepCount}/${countTotalSteps(ast)} : ${instr.directive} ${instr.args}`);

      switch (instr.directive) {
        case 'RUN':
          logs.push(` ---> Running in ${randomHex(6)}`);
          // RUN komutlarını simüle et
          if (instr.parsed.commands) {
            for (const cmd of instr.parsed.commands) {
              logs.push(...simulateRunCommand(cmd));
            }
          }
          logs.push(`Removing intermediate container ${randomHex(6)}`);
          logs.push(` ---> ${randomHex(6)}`);
          break;

        case 'COPY':
        case 'ADD':
          logs.push(` ---> ${randomHex(6)}`);
          break;

        case 'WORKDIR':
          logs.push(` ---> Running in ${randomHex(6)}`);
          logs.push(` ---> ${randomHex(6)}`);
          break;

        case 'EXPOSE':
          logs.push(` ---> Running in ${randomHex(6)}`);
          logs.push(` ---> ${randomHex(6)}`);
          break;

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
          logs.push(` ---> ${randomHex(6)}`);
          break;

        default:
          logs.push(` ---> ${randomHex(6)}`);
      }
      logs.push('');
    }
  }

  const imageId = randomHex(6);
  logs.push(`Successfully built ${imageId}`);
  logs.push(`Successfully tagged app:latest`);

  return { logs, success: true, errors: [], imageId };
}

/**
 * RUN komutu simülasyonu — gerçekçi çıktı üretir.
 */
function simulateRunCommand(cmd) {
  const lines = [];
  const trimmed = cmd.trim();

  // pip install
  if (trimmed.includes('pip install')) {
    const packages = trimmed.replace(/pip3?\s+install\s+(-[^\s]+\s+)*/g, '').trim().split(/\s+/);
    for (const pkg of packages) {
      if (pkg.startsWith('-')) continue;
      lines.push(`Collecting ${pkg}`);
      lines.push(`  Downloading ${pkg}-1.0.0-py3-none-any.whl (42 kB)`);
    }
    lines.push('Installing collected packages: ' + packages.filter(p => !p.startsWith('-')).join(', '));
    lines.push('Successfully installed ' + packages.filter(p => !p.startsWith('-')).map(p => `${p}-1.0.0`).join(' '));
  }
  // apt-get install
  else if (trimmed.includes('apt-get install') || trimmed.includes('apt install')) {
    lines.push('Reading package lists...');
    lines.push('Building dependency tree...');
    lines.push('The following NEW packages will be installed:');
    lines.push('0 upgraded, 1 newly installed, 0 to remove.');
    lines.push('Setting up packages...');
  }
  // apk add
  else if (trimmed.includes('apk add')) {
    lines.push('fetch https://dl-cdn.alpinelinux.org/alpine/v3.18/main/');
    lines.push('OK: 15 MiB in 30 packages');
  }
  // npm install
  else if (trimmed.includes('npm install') || trimmed.includes('npm ci')) {
    lines.push('npm warn deprecated some-package@1.0.0');
    lines.push('added 142 packages in 8s');
  }
  // mkdir
  else if (trimmed.startsWith('mkdir')) {
    // sessiz
  }
  // chmod
  else if (trimmed.startsWith('chmod')) {
    // sessiz
  }
  // Diğer
  else {
    lines.push(`+ ${trimmed}`);
  }

  return lines;
}

/**
 * Container state yönetimi
 */
let containers = {};
let containerIdCounter = 1;

export function dockerRun(imageName, options = {}) {
  const id = `container_${containerIdCounter++}`;
  const port = options.port || 8080;

  containers[id] = {
    id,
    image: imageName,
    status: 'running',
    port,
    createdAt: Date.now(),
  };

  return {
    success: true,
    containerId: id,
    message: `Container ${id.substring(0, 12)} started on port ${port}`,
    port,
  };
}

export function dockerStop(containerId) {
  if (!containers[containerId]) {
    return { success: false, message: `Container ${containerId} bulunamadı` };
  }
  containers[containerId].status = 'stopped';
  return { success: true, message: `Container ${containerId} durduruldu` };
}

export function dockerPs() {
  return Object.values(containers).filter((c) => c.status === 'running');
}

export function dockerPsAll() {
  return Object.values(containers);
}

export function resetContainers() {
  containers = {};
  containerIdCounter = 1;
}

/**
 * docker build komutu simülasyonu
 * Dosya sisteminden Dockerfile okur → parse eder → build log üretir
 */
export function simulateDockerBuild(vfs, dockerfilePath = 'Dockerfile') {
  const result = vfs.cat(dockerfilePath);
  if (!result.success) {
    return {
      logs: [`\x1b[31mERROR\x1b[0m: ${dockerfilePath}: Dosya bulunamadı`],
      success: false,
      errors: [`${dockerfilePath} bulunamadı`],
      imageId: null,
    };
  }

  const { ast } = parseDockerfile(result.content);
  return generateBuildLogs(ast);
}

// Yardımcı: rastgele hex string
function randomHex(len) {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Yardımcı: toplam step sayısı
function countTotalSteps(ast) {
  let count = 0;
  for (const stage of ast.stages) {
    count += 1 + stage.instructions.length; // FROM + instructions
  }
  return count;
}
