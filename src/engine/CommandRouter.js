/**
 * CommandRouter.js — Terminal komut yönlendiricisi (Faz 15 / GÖREV GRUBU 2 Genişletmesi & Round 6 Docker CLI)
 *
 * Kullanıcının girdiği komutları parse edip ilgili motorlara yönlendirir.
 * Desteklenen komut aileleri: Linux VFS, Git, Docker & Docker Compose
 */

import {
  simulateDockerBuild,
  dockerRun,
  dockerStop,
  dockerStart,
  dockerRestart,
  dockerRm,
  dockerRmi,
  dockerPs,
  dockerPsAll,
  dockerImages,
  dockerLogs,
  dockerExec,
  dockerInspectContainer,
  dockerPruneContainers,
  dockerTop,
  dockerRename,
  dockerCp,
  dockerImageInspect,
  dockerImagePrune,
  dockerImageHistory,
  dockerPull,
  dockerPush,
  dockerTag,
  dockerVolumeCreate,
  dockerVolumeLs,
  dockerVolumeRm,
  dockerVolumeInspect,
  dockerVolumePrune,
  dockerNetworkCreate,
  dockerNetworkLs,
  dockerNetworkRm,
  dockerNetworkInspect,
  dockerNetworkConnect,
  dockerNetworkDisconnect,
  dockerNetworkPrune,
  dockerSystemDf,
  dockerSystemPrune,
  dockerStats,
  dockerHelp,
} from './DockerSimulator.js';
import { parseCompose, generateComposeUpLogs, generateComposeDownLogs } from './ComposeParser.js';
import { windowManager } from './WindowManager.js';
import useGameStore from '../store/useGameStore.js';
import missions from '../data/missions.json';
import companies from '../data/companies.json';
import { verifyMission } from './MissionEngine.js';

// Global komut geçmişi ve ortam değişkenleri
const commandHistory = [];
const envVars = {
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  HOME: '/home/user',
  USER: 'user',
  SHELL: '/bin/bash',
  TERM: 'xterm-256color',
};

// Takip edilen paketler (apt-get install simülasyonu)
const installedPackages = new Set(['curl', 'wget', 'git', 'docker', 'python3', 'pip']);

/**
 * Ana komut çalıştırma fonksiyonu
 */
export function executeCommand(input, vfs, gitState = { initialized: false, staged: [], commits: [], branch: 'main' }) {
  const trimmed = input.trim();
  if (!trimmed) return [];

  commandHistory.push(trimmed);

  if (trimmed === 'docker compose' || trimmed.startsWith('docker compose ')) {
    const composeArgs = trimmed.replace(/^docker\s+compose\s*/, '').split(/\s+/).filter(Boolean);
    return handleDockerCompose(composeArgs, vfs);
  }
  if (trimmed.startsWith('docker-compose')) {
    return handleDockerCompose(trimmed.split(/\s+/).slice(1), vfs);
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd) {
    case 'pwd':
      return [vfs.pwd()];

    case 'ls': {
      const isLongFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
      const targetArg = args.find((a) => !a.startsWith('-')) || vfs.pwd();
      const result = vfs.ls(targetArg);
      if (!result.success) return [result.error];
      if (result.entries.length === 0) return ['(boş dizin)'];

      if (isLongFormat) {
        const lines = [`total ${result.entries.length * 4}`];
        for (const e of result.entries) {
          let perms = '-rw-r--r--';
          let displayName = e.name;

          if (e.type === 'dir') {
            perms = 'drwxr-xr-x';
            displayName = `\x1b[34m${e.name}/\x1b[0m`;
          } else if (e.type === 'app') {
            perms = 'arwxr-xr-x';
            displayName = `\x1b[36m[app] ${e.name}\x1b[0m`;
          }

          const size = String(e.size).padStart(6);
          const date = e.date || 'Jan 12 08:00';
          lines.push(`${perms}  1 user user  ${size} ${date} ${displayName}`);
        }
        return lines;
      }

      return result.entries.map((e) => {
        if (e.type === 'dir') return `\x1b[34m${e.name}/\x1b[0m`;
        if (e.type === 'app') return `\x1b[36m[app] ${e.name}\x1b[0m`;
        return e.name;
      });
    }

    case 'cd': {
      const rawPath = trimmed.substring(2).trim();
      let path = rawPath;
      if ((rawPath.startsWith('"') && rawPath.endsWith('"')) || (rawPath.startsWith("'") && rawPath.endsWith("'"))) {
        path = rawPath.slice(1, -1);
      } else {
        path = rawPath.replace(/\\ /g, ' ');
      }
      const result = vfs.cd(path || args[0]);
      return result.success ? [] : [result.error];
    }

    case 'open': {
      const rawTarget = trimmed.substring(4).trim();
      if (!rawTarget) return ['kullanım: open <dosya|klasör|uygulama>'];

      let targetName = rawTarget;
      if ((rawTarget.startsWith('"') && rawTarget.endsWith('"')) || (rawTarget.startsWith("'") && rawTarget.endsWith("'"))) {
        targetName = rawTarget.slice(1, -1);
      } else {
        targetName = rawTarget.replace(/\\ /g, ' ');
      }

      const currentCwd = vfs.pwd();
      const targetFullPath = targetName.startsWith('/') ? targetName : `${currentCwd}/${targetName}`.replace(/\/+/g, '/');
      const { node, found } = vfs._getNode(targetFullPath);

      if (!found) {
        return [`open: ${targetName}: Böyle bir dosya veya dizin yok.`];
      }

      if (node._type === 'app') {
        windowManager.openApp(node.appId);
        return [];
      }

      if (node._type === 'dir') {
        windowManager.openApp('explorer', { initialPath: targetFullPath });
        return [];
      }

      if (node._type === 'file') {
        const ext = targetName.toLowerCase();
        const isSupportedCodeFile = [
          '.py', '.js', '.ts', '.go', '.md', '.txt', '.json', '.yml', '.yaml', '.env', '.sh', '.gitignore', 'dockerfile'
        ].some((e) => ext.endsWith(e) || ext.includes('dockerfile'));

        if (isSupportedCodeFile) {
          windowManager.openApp('editor', {
            initialFile: { name: targetName, path: targetFullPath, content: node.content },
          });
          return [];
        }

        return [`open: ${targetName}: Bu dosya türünü açacak bir uygulama yok.`];
      }

      return [`open: ${targetName}: Tanınmayan düğüm türü.`];
    }

    case 'cat': {
      if (!args[0]) return ['cat: dosya adı gerekli'];
      const result = vfs.cat(args[0]);
      return result.success ? result.content.split('\n') : [result.error];
    }

    case 'head': {
      if (!args[0]) return ['head: dosya adı gerekli'];
      const lines = parseInt(args.find((a) => a.startsWith('-n'))?.replace('-n', '')) || 10;
      const file = args.find((a) => !a.startsWith('-')) || args[0];
      const result = vfs.cat(file);
      if (!result.success) return [result.error];
      return result.content.split('\n').slice(0, lines);
    }

    case 'tail': {
      if (!args[0]) return ['tail: dosya adı gerekli'];
      const lines = parseInt(args.find((a) => a.startsWith('-n'))?.replace('-n', '')) || 10;
      const file = args.find((a) => !a.startsWith('-')) || args[0];
      const result = vfs.cat(file);
      if (!result.success) return [result.error];
      const allLines = result.content.split('\n');
      return allLines.slice(Math.max(0, allLines.length - lines));
    }

    case 'cp': {
      if (args.length < 2) return ['cp: kaynak ve hedef gerekli'];
      const result = vfs.cp(args[0], args[1]);
      return result.success ? [] : [result.error];
    }

    case 'mv': {
      if (args.length < 2) return ['mv: kaynak ve hedef gerekli'];
      const result = vfs.mv(args[0], args[1]);
      return result.success ? [] : [result.error];
    }

    case 'mkdir': {
      if (!args[0]) return ['mkdir: dizin adı gerekli'];
      const recursive = args.includes('-p');
      const dirPath = args.find((a) => !a.startsWith('-')) || args[0];
      const result = vfs.mkdir(dirPath, recursive);
      return result.success ? [] : [result.error];
    }

    case 'touch': {
      if (!args[0]) return ['touch: dosya adı gerekli'];
      const result = vfs.touch(args[0]);
      return result.success ? [] : [result.error];
    }

    case 'rm': {
      if (!args[0]) return ['rm: dosya veya dizin adı gerekli'];
      const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-f');
      const target = args.find((a) => !a.startsWith('-')) || args[0];
      const result = vfs.rm(target, recursive);
      return result.success ? [] : [result.error];
    }

    case 'echo': {
      const text = args.join(' ');
      if (text.includes('>')) {
        const [content, file] = text.split('>').map((s) => s.trim());
        const result = vfs.writeFile(file, content.replace(/^["']|["']$/g, '') + '\n');
        return result.success ? [] : [result.error];
      }
      return [text.replace(/^["']|["']$/g, '')];
    }

    case 'env':
      return Object.entries(envVars).map(([k, v]) => `${k}=${v}`);

    case 'export': {
      if (!args[0] || !args[0].includes('=')) return ['usage: export VAR=value'];
      const [k, ...vParts] = args[0].split('=');
      envVars[k] = vParts.join('=').replace(/^["']|["']$/g, '');
      return [];
    }

    case 'grep': {
      if (args.length < 2) return ['usage: grep <pattern> <file>'];
      const result = vfs.grep(args[0], args[1]);
      return result.success ? result.lines : [result.error];
    }

    case 'find': {
      const dir = args.find((a) => !a.startsWith('-')) || '.';
      return vfs.find(dir);
    }

    case 'history':
      return commandHistory.map((cmdStr, i) => ` ${i + 1}  ${cmdStr}`);

    case 'apt-get':
    case 'apt': {
      const sub = args[0];
      if (sub === 'update') {
        return [
          'Get:1 http://deb.debian.org/debian bookworm InRelease [151 kB]',
          'Get:2 http://deb.debian.org/debian-security bookworm-security InRelease [48.0 kB]',
          'Reading package lists... Done',
        ];
      }
      if (sub === 'install') {
        const pkg = args[1];
        if (!pkg) return ['apt-get install: paket adı gerekli'];
        installedPackages.add(pkg);
        return [
          `Reading package lists... Done`,
          `Building dependency tree... Done`,
          `The following NEW packages will be installed: ${pkg}`,
          `0 upgraded, 1 newly installed, 0 to remove.`,
          `Setting up ${pkg} (1.0.0-1) ...`,
        ];
      }
      return ['apt-get update | apt-get install <package>'];
    }

    case 'tree': {
      const lines = vfs.tree(args[0]);
      return lines.length > 0 ? lines : ['(boş dizin)'];
    }

    case 'curl': {
      const urlArg = args.find((a) => !a.startsWith('-')) || 'http://localhost:8080';
      const isHead = args.includes('-I') || args.includes('--head');
      const portMatch = urlArg.match(/:(\d+)/);
      const port = portMatch ? parseInt(portMatch[1]) : 8080;
      const running = dockerPs();
      const container = running.find((c) => c.port === port);

      if (!container || container.isListening === false) {
        return [`curl: (7) Failed to connect to localhost port ${port}: Connection refused`];
      }

      if (isHead) {
        return [
          'HTTP/1.1 200 OK',
          'date: ' + new Date().toUTCString(),
          'server: uvicorn',
          'content-type: application/json',
          'content-length: 42',
        ];
      }

      return [
        '{"status": "healthy", "service": "mlops-app", "framework": "' + (container.image || 'python') + '"}',
      ];
    }

    case 'wget': {
      const urlArg = args.find((a) => !a.startsWith('-')) || 'http://localhost:8080';
      const portMatch = urlArg.match(/:(\d+)/);
      const port = portMatch ? parseInt(portMatch[1]) : 8080;
      const running = dockerPs();
      const container = running.find((c) => c.port === port);

      if (!container || container.isListening === false) {
        return [
          `Connecting to localhost:${port}... failed: Connection refused.`,
        ];
      }

      return [
        `Connecting to localhost:${port}... connected.`,
        'HTTP request sent, awaiting response... 200 OK',
        'Length: 42 [application/json]',
        `Saving to: 'index.html'`,
        '',
        `2026-08-18 12:00:00 (1.45 MB/s) - 'index.html' saved [42/42]`,
      ];
    }

    // Git Simülasyonu
    case 'git':
      return handleGit(args, vfs, gitState);

    // Docker Simülasyonu
    case 'docker':
      return handleDocker(args, vfs);

    case 'docker-compose':
      return handleDockerCompose(args.slice(1), vfs);

    case 'help':
    case 'man': {
      if (args[0] === 'ls') {
        return [
          'ls - Dizin içeriğini listeler.',
          'Kullanım: ls [-l] [dizin]',
          '',
          'Biçimlendirme Notları:',
          '  - Klasörler mavi renkle ve sonuna / eklenerek gösterilir (örn. projects/).',
          '  - [app] etiketi ve turkuaz (cyan) renkli girdiler çalıştırılabilir uygulama kısayollarıdır (örn. [app] Terminal).',
          '  - ls -l çıktısındaki en baştaki "a" harfi uygulama düğümlerini temsil eder (arwxr-xr-x).',
        ];
      }
      return [
        'Kullanılabilir komutlar:',
        '  Linux: pwd, ls, cd, open, cat, head, tail, cp, mv, mkdir, touch, rm, echo, env, export, grep, find, history, clear, apt-get',
        '  Git: git init/clone/status/add/commit/push/pull/log',
        '  Docker: docker build/run/ps/stop/start/rm/rmi/images/logs/exec/inspect/cp/stats/top/system/volume/network/container/image',
        '  Compose: docker-compose up/down/ps/config veya docker compose ...',
      ];
    }

    case 'clear':
      return ['__CLEAR__'];

    default:
      return [`bash: ${cmd}: command not found`];
  }
}

// === VFS-TABANLI GİT YARDIMCI FONKSİYONLARI (GÖREV GRUBU 3) ===

export function findGitRepoRoot(vfs, startPath = null) {
  let current = startPath || vfs.pwd();
  while (current) {
    const gitPath = `${current}/.git`.replace(/\/+/g, '/');
    const lsRes = vfs.ls(gitPath);
    if (lsRes.success) {
      return current;
    }
    if (current === '/' || current === '') break;
    const lastSlash = current.lastIndexOf('/');
    if (lastSlash === -1 || lastSlash === 0) {
      if (current !== '/') {
        if (vfs.ls('/.git').success) return '/';
      }
      break;
    }
    current = current.substring(0, lastSlash);
  }
  return null;
}

export function getVfsGitState(vfs, repoRoot) {
  if (!repoRoot) return { initialized: false, staged: [], commits: [], branch: 'main' };
  const stateFile = `${repoRoot}/.git/gitstate.json`.replace(/\/+/g, '/');
  const res = vfs.cat(stateFile);
  if (res.success) {
    try {
      const parsed = JSON.parse(res.content);
      return { initialized: true, ...parsed };
    } catch {
      // JSON parse fallback
    }
  }
  return {
    initialized: true,
    repoPath: repoRoot,
    staged: [],
    commits: [{ hash: 'a1b2c3d', message: 'Initial commit', author: 'origin' }],
    branch: 'main',
  };
}

export function saveVfsGitState(vfs, repoRoot, state) {
  if (!repoRoot) return;
  vfs.mkdir(`${repoRoot}/.git`, true);
  const stateFile = `${repoRoot}/.git/gitstate.json`.replace(/\/+/g, '/');
  vfs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

// === GIT DISPATCHER ===
function handleGit(args, vfs, _legacyGitState = null) {
  const subcommand = args[0];
  const pwd = vfs.pwd();
  const repoRoot = findGitRepoRoot(vfs, pwd);
  const gitState = repoRoot ? getVfsGitState(vfs, repoRoot) : { initialized: false, staged: [], commits: [], branch: 'main' };

  switch (subcommand) {
    case 'init': {
      const targetRepo = pwd;
      vfs.mkdir(`${targetRepo}/.git`, true);
      const newState = {
        initialized: true,
        repoPath: targetRepo,
        staged: [],
        commits: [],
        branch: 'main',
      };
      saveVfsGitState(vfs, targetRepo, newState);
      return ['Initialized empty Git repository in ' + targetRepo + '/.git/'];
    }

    case 'clone': {
      const rawUrl = args[1] || '';
      if (!rawUrl) {
        return ['fatal: You must specify a repository to clone.'];
      }

      const storeState = useGameStore.getState();
      const activeMissionIds = storeState.career.activeMissions || [];
      const completedMissionIds = storeState.career.completedMissions || [];

      // URL'den repo adını çıkar (.git uzantısı ve son path segmenti)
      const urlSegments = rawUrl.split('/').filter(Boolean);
      const lastSegment = urlSegments[urlSegments.length - 1] || 'repository';
      const urlRepoName = lastSegment.replace(/\.git$/, '');

      // Store ve missions.json içindeki görevlerle eşle (GÖREV GRUBU 2)
      let targetMission = missions.find(
        (m) => m.id === urlRepoName ||
               m.repoName === urlRepoName ||
               (m.repoUrl && (m.repoUrl === rawUrl || m.repoUrl.endsWith(urlRepoName + '.git') || m.repoUrl.endsWith(urlRepoName)))
      );

      const repoDirName = urlRepoName;
      const targetPath = `${pwd}/${repoDirName}`.replace(/\/+/g, '/');

      // VFS üzerinde klasörleri oluştur ve dosyaları yaz
      vfs.mkdir(repoDirName, true);
      vfs.mkdir(`${repoDirName}/.git`, true);

      if (targetMission) {
        const companyObj = companies.find((c) => c.id === targetMission.companyId);
        const companyName = companyObj ? companyObj.name : 'DevJobs Partner';
        const isAdvanced = (targetMission.stage || 1) >= 5;

        // Repo dosyalarını yaz (Zorluk seviyesi kuralları)
        if (targetMission.repoFiles) {
          for (const [filename, content] of Object.entries(targetMission.repoFiles)) {
            // Aşama 5+: Asla hazır Dockerfile veya compose dosyası yazılmaz!
            if (isAdvanced && (filename.toLowerCase().includes('dockerfile') || filename.toLowerCase().includes('compose'))) {
              continue;
            }
            if (filename.includes('/')) {
              const subDir = `${repoDirName}/${filename.split('/').slice(0, -1).join('/')}`;
              vfs.mkdir(subDir, true);
            }
            vfs.writeFile(`${repoDirName}/${filename}`, content);
          }
        }

        // Görev Tanımı README.md Oluştur (Her aşama için zorunlu)
        const unoptMB = targetMission.unoptimizedSizeMB || 20000;
        const unoptStr = unoptMB >= 1000 ? `${(unoptMB / 1000).toFixed(0)}GB` : `${unoptMB}MB`;
        const maxMB = targetMission.expectedCriteria?.maxImageSizeMB || 1536;
        const maxStr = maxMB >= 1000 ? `${(maxMB / 1000).toFixed(1)}GB` : `${maxMB}MB`;

        let sizeNotice = '';
        if (targetMission.expectedCriteria?.maxImageSizeMB || (targetMission.stage || 1) >= 2) {
          sizeNotice = `\n- 📦 **İmaj Boyutu Kısıtlaması:** Bu projenin optimize edilmemiş hali ${unoptStr} büyüklüğünde. Doğru base image seçimi, multi-stage yapı ve gereksiz dosyaların temizlenmesiyle nihai imaj boyutunu ${maxStr} altına indirin.`;
        }

        const hintsText = targetMission.hints && targetMission.hints.length > 0
          ? targetMission.hints.map((h) => `- ${h}`).join('\n') + sizeNotice
          : '- Projenin Dockerfile / Compose yapılandırmasını eksiksiz tamamlayın.' + sizeNotice;

        const readmeContent = `# ${targetMission.title}

**Şirket:** ${companyName}
**Zorluk Seviyesi:** Aşama ${targetMission.stage || 1} (${targetMission.difficulty || 1} Yıldız)
**Ödül:** ₺${targetMission.reward?.money || 0} | +${targetMission.reward?.careerPoints || 0} XP (Aylık Bakım: ₺${targetMission.reward?.monthlyMaintenance || 0})

---

## 📋 Görev Tanımı ve Senaryo
${targetMission.description}

## 🎯 Teknik Kısıtlamalar ve Hedefler
${hintsText}

## 🚀 Nasıl Başlanır ve Teslim Edilir?
1. Proje dosyalarını inceleyin ve uygun \`Dockerfile\` / \`docker-compose.yml\` yapılandırmasını oluşturun.
2. Terminalde \`docker build\` veya \`docker compose up\` ile container'ı çalıştırıp test edin.
3. Değişiklikleri Git ile commitleyip remote depoya gönderin:
\`\`\`bash
git add .
git commit -m "feat: complete containerization"
git push origin main
\`\`\`
4. CI/CD testleri başarıyla tamamlandığında **İş Platformu (DevJobs)** veya telefonunuzdaki **DevJobs Mobil** uygulamasından **"Görevi Teslim Et"** butonuna basarak ödülünüzü alın.
`;

        vfs.writeFile(`${repoDirName}/README.md`, readmeContent);
      } else {
        vfs.touch(`${repoDirName}/README.md`);
        vfs.writeFile(`${repoDirName}/README.md`, `# ${repoDirName}\nMLOps repository cloned successfully.\n`);
      }

      // VFS Git state kaydet
      const initialGitState = {
        initialized: true,
        repoPath: targetPath,
        staged: [],
        commits: [{ hash: 'a1b2c3d', message: 'Initial commit', author: 'origin' }],
        branch: 'main',
      };
      saveVfsGitState(vfs, targetPath, initialGitState);

      // Store'da activeMissions içinde değilse ekle
      if (targetMission && !activeMissionIds.includes(targetMission.id) && !completedMissionIds.includes(targetMission.id)) {
        storeState.acceptMission(targetMission.id);
      }

      return [
        `Cloning into '${repoDirName}'...`,
        'remote: Enumerating objects: 8, done.',
        'remote: Counting objects: 100% (8/8), done.',
        'remote: Compressing objects: 100% (6/6), done.',
        'Receiving objects: 100% (8/8), 1.45 KiB | 1.45 MiB/s, done.',
        'Resolving deltas: 100% (2/2), done.',
      ];
    }

    case 'status':
      if (!repoRoot || !gitState.initialized) return ['fatal: not a git repository (or any of the parent directories): .git'];
      return [
        `On branch ${gitState.branch}`,
        gitState.staged.length > 0
          ? `Changes to be committed:\n  ${gitState.staged.map((f) => `staged: ${f}`).join('\n  ')}`
          : 'nothing to commit, working tree clean',
      ];

    case 'add': {
      if (!repoRoot || !gitState.initialized) return ['fatal: not a git repository (or any of the parent directories): .git'];
      const file = args[1];
      if (!file) return ['Nothing specified, nothing added.'];
      if (file === '.' || file === '-A') {
        const ls = vfs.ls();
        if (ls.success) {
          gitState.staged = ls.entries.filter((e) => e.name !== '.git').map((e) => e.name);
        }
      } else {
        if (!gitState.staged.includes(file)) gitState.staged.push(file);
      }
      saveVfsGitState(vfs, repoRoot, gitState);
      return [];
    }

    case 'commit': {
      if (!repoRoot || !gitState.initialized) return ['fatal: not a git repository (or any of the parent directories): .git'];
      if (gitState.staged.length === 0) return ['nothing to commit, working tree clean'];
      const msgIdx = args.indexOf('-m');
      const message = msgIdx !== -1 ? args.slice(msgIdx + 1).join(' ').replace(/"/g, '') : 'No message';
      const hash = Math.random().toString(16).slice(2, 9);
      gitState.commits.push({ hash, message, author: 'you' });
      const count = gitState.staged.length;
      gitState.staged = [];
      saveVfsGitState(vfs, repoRoot, gitState);
      return [`[${gitState.branch} ${hash}] ${message}`, ` ${count} file(s) changed`];
    }

    case 'push': {
      if (!repoRoot || !gitState.initialized) return ['fatal: not a git repository (or any of the parent directories): .git'];

      const storeState = useGameStore.getState();
      const activeMissionIds = storeState.career.activeMissions || [];

      // Bulunulan dizinden veya aktif görevlerden uygun görevi bul
      let targetMissionId = activeMissionIds.find((id) => pwd.includes(id) || repoRoot.includes(id));
      if (!targetMissionId && activeMissionIds.length > 0) {
        targetMissionId = activeMissionIds[0];
      }

      if (!targetMissionId) {
        return [
          `Enumerating objects: ${gitState.commits.length || 1}, done.`,
          `To origin/${gitState.branch}`,
          '   a1b2c3d..f4e5d6c  main -> main',
          'Everything up-to-date',
        ];
      }

      const runningContainers = dockerPs();
      const verifyRes = verifyMission(targetMissionId, vfs, runningContainers);

      if (verifyRes.passed) {
        // Görevi teslime hazır (ready_to_deliver) olarak işaretle
        storeState.markMissionReadyToDeliver(targetMissionId);

        return [
          `Writing objects: 100% (5/5), 450 bytes | 450.00 KiB/s, done.`,
          `Total 5 (delta 2), reused 0 (delta 0)`,
          `To origin/${gitState.branch}`,
          `   a1b2c3d..e4f5a6b  main -> main`,
          ``,
          `remote: Triggering CI/CD Pipeline...`,
          `remote: \x1b[32mPipeline PASSED ✅\x1b[0m`,
          `remote: Port ${verifyRes.requiredPort} üzerinde çalışan '${verifyRes.containerName}' container'ı doğrulandı.`,
          `remote: \x1b[33mProjeniz başarıyla derlendi. Lütfen İş Platformu üzerinden görevinizi teslim ediniz.\x1b[0m`,
        ];
      } else {
        const reqPort = verifyRes.requiredPort || 8080;
        return [
          `Writing objects: 100% (5/5), 450 bytes | 450.00 KiB/s, done.`,
          `To origin/${gitState.branch}`,
          `   a1b2c3d..e4f5a6b  main -> main`,
          ``,
          `remote: Triggering CI/CD Pipeline...`,
          `remote: \x1b[31mPipeline FAILED ❌\x1b[0m`,
          `remote: \x1b[31m${verifyRes.message}\x1b[0m`,
          `remote: \x1b[33mLütfen 'docker run -p ${reqPort}:${reqPort} ...' komutu ile servisi ayağa kaldırıp tekrar 'git push' yapın.\x1b[0m`,
        ];
      }
    }

    case 'pull':
      if (!repoRoot || !gitState.initialized) return ['fatal: not a git repository (or any of the parent directories): .git'];
      return ['Already up to date.'];

    case 'log':
      if (!repoRoot || !gitState.initialized) return ['fatal: not a git repository (or any of the parent directories): .git'];
      if (gitState.commits.length === 0) return ['No commits yet'];
      return gitState.commits.slice().reverse().map((c) => `\x1b[33m${c.hash}\x1b[0m ${c.message} (${c.author})`);

    case 'branch':
      if (!repoRoot || !gitState.initialized) return ['fatal: not a git repository (or any of the parent directories): .git'];
      return [`* ${gitState.branch}`];

    default:
      return [`git: '${subcommand}' is not a git command. See 'git --help'.`];
  }
}

// === DOCKER DISPATCHER (ROUND 6 SINGLE HANDLER CORE) ===
function handleDocker(args, vfs) {
  if (args.length === 0 || args.includes('--help')) {
    const group = args[0] !== '--help' ? args[0] : null;
    return dockerHelp(group);
  }

  const sub = args[0];

  if (args.includes('--version') || sub === 'version') {
    return ['Docker version 24.0.7, build afdd53b'];
  }

  // 1. CONTAINER MANAGEMENT COMMANDS
  if (sub === 'container') {
    const action = args[1];
    if (!action || action === '--help') return dockerHelp('container');

    switch (action) {
      case 'run': return handleDockerRun(args.slice(2));
      case 'ls': return handleDockerPs(args.slice(2));
      case 'stop': return handleDockerStop(args.slice(2));
      case 'start': return handleDockerStart(args.slice(2));
      case 'restart': return handleDockerRestart(args.slice(2));
      case 'rm': return handleDockerRm(args.slice(2));
      case 'logs': return handleDockerLogs(args.slice(2));
      case 'exec': return handleDockerExec(args.slice(2));
      case 'inspect': return dockerInspectContainer(args[2]);
      case 'prune': return dockerPruneContainers();
      case 'top': return dockerTop(args[2]);
      case 'rename': return handleDockerRename(args.slice(2));
      case 'cp': return handleDockerCp(args.slice(2), vfs);
      default: return [`docker: 'container ${action}' is not a docker command. See 'docker container --help'.`];
    }
  }

  // 2. IMAGE MANAGEMENT COMMANDS
  if (sub === 'image') {
    const action = args[1];
    if (!action || action === '--help') return dockerHelp('image');

    switch (action) {
      case 'ls': return handleDockerImages(args.slice(2));
      case 'rm': return handleDockerRmi(args.slice(2));
      case 'inspect': return dockerImageInspect(args[2]);
      case 'history': return dockerImageHistory(args[2]);
      case 'prune': return dockerImagePrune();
      case 'pull': return dockerPull(args[2] || 'alpine');
      case 'push': return dockerPush(args[2] || 'app:latest');
      case 'tag': return handleDockerTag(args.slice(2));
      default: return [`docker: 'image ${action}' is not a docker command. See 'docker image --help'.`];
    }
  }

  // 3. VOLUME MANAGEMENT COMMANDS
  if (sub === 'volume') {
    const action = args[1];
    if (!action || action === '--help') return dockerHelp('volume');

    switch (action) {
      case 'create': return [dockerVolumeCreate(args[2] || 'app_vol')];
      case 'ls': return handleDockerVolumeLs();
      case 'rm': return handleDockerVolumeRm(args[2]);
      case 'inspect': return dockerVolumeInspect(args[2]);
      case 'prune': return dockerVolumePrune();
      default: return [`docker: 'volume ${action}' is not a docker command. See 'docker volume --help'.`];
    }
  }

  // 4. NETWORK MANAGEMENT COMMANDS
  if (sub === 'network') {
    const action = args[1];
    if (!action || action === '--help') return dockerHelp('network');

    switch (action) {
      case 'create': return [dockerNetworkCreate(args[2] || 'my_net')];
      case 'ls': return handleDockerNetworkLs();
      case 'rm': return handleDockerNetworkRm(args[2]);
      case 'inspect': return dockerNetworkInspect(args[2]);
      case 'connect': return handleDockerNetworkConnect(args.slice(2));
      case 'disconnect': return handleDockerNetworkDisconnect(args.slice(2));
      case 'prune': return dockerNetworkPrune();
      default: return [`docker: 'network ${action}' is not a docker command. See 'docker network --help'.`];
    }
  }

  // 5. SYSTEM MANAGEMENT COMMANDS
  if (sub === 'system') {
    const action = args[1];
    if (!action || action === '--help') return dockerHelp('system');

    switch (action) {
      case 'df': return dockerSystemDf();
      case 'prune': return dockerSystemPrune({ all: args.includes('-a') });
      default: return [`docker: 'system ${action}' is not a docker command. See 'docker system --help'.`];
    }
  }

  // 6. CLASSIC / SHORT ALIASES (ROUTED TO SAME CORE HANDLERS)
  switch (sub) {
    case 'build': return handleDockerBuild(args.slice(1), vfs);
    case 'run': return handleDockerRun(args.slice(1), vfs);
    case 'ps': return handleDockerPs(args.slice(1));
    case 'stop': return handleDockerStop(args.slice(1));
    case 'start': return handleDockerStart(args.slice(1));
    case 'restart': return handleDockerRestart(args.slice(1));
    case 'rm': return handleDockerRm(args.slice(1));
    case 'rmi': return handleDockerRmi(args.slice(1));
    case 'images': return handleDockerImages(args.slice(1));
    case 'logs': return handleDockerLogs(args.slice(1));
    case 'exec': return handleDockerExec(args.slice(1));
    case 'inspect': return dockerInspectContainer(args[1]);
    case 'pull': return dockerPull(args[1] || 'alpine');
    case 'push': return dockerPush(args[1] || 'app:latest');
    case 'tag': return handleDockerTag(args.slice(1));
    case 'cp': return handleDockerCp(args.slice(1), vfs);
    case 'top': return dockerTop(args[1]);
    case 'rename': return handleDockerRename(args.slice(1));
    case 'stats': return dockerStats();
    default: return [`docker: '${sub}' is not a docker command. See 'docker --help'.`];
  }
}

// === DOCKER HELPER ACTION BUILDERS ===

function handleDockerBuild(subArgs, vfs) {
  const fileFlag = subArgs.indexOf('-f');
  const dockerfilePath = fileFlag !== -1 ? subArgs[fileFlag + 1] : 'Dockerfile';
  const tagFlag = subArgs.indexOf('-t');
  const tag = tagFlag !== -1 ? subArgs[tagFlag + 1] : 'app:latest';
  const result = simulateDockerBuild(vfs, dockerfilePath, { tag });
  return result.logs;
}

function handleDockerRun(subArgs, vfs = null) {
  const image = subArgs.find((a) => !a.startsWith('-')) || 'app:latest';
  const portIdx = subArgs.indexOf('-p');
  let port = 8080;
  if (portIdx !== -1 && subArgs[portIdx + 1]) {
    const portMap = subArgs[portIdx + 1].split(':');
    port = parseInt(portMap[0]) || 8080;
  }
  const nameIdx = subArgs.indexOf('--name');
  const name = nameIdx !== -1 ? subArgs[nameIdx + 1] : undefined;

  const result = dockerRun(image, { port, name, vfs });
  return [result.message];
}

function handleDockerStop(subArgs) {
  const cid = subArgs[0];
  if (!cid) return ['Usage: docker stop <container>'];
  return [dockerStop(cid).message];
}

function handleDockerStart(subArgs) {
  const cid = subArgs[0];
  if (!cid) return ['Usage: docker start <container>'];
  return [dockerStart(cid).message];
}

function handleDockerRestart(subArgs) {
  const cid = subArgs[0];
  if (!cid) return ['Usage: docker restart <container>'];
  return [dockerRestart(cid).message];
}

function handleDockerRm(subArgs) {
  const cid = subArgs[0];
  if (!cid) return ['Usage: docker rm <container>'];
  return [dockerRm(cid).message];
}

function handleDockerRmi(subArgs) {
  const img = subArgs[0];
  if (!img) return ['Usage: docker rmi <image>'];
  return [dockerRmi(img).message];
}

function handleDockerPs(subArgs) {
  const all = subArgs.includes('-a');
  const list = all ? dockerPsAll() : dockerPs();
  if (list.length === 0) return ['CONTAINER ID   IMAGE   STATUS   PORTS'];
  const lines = ['CONTAINER ID   IMAGE          STATUS      PORTS'];
  for (const c of list) {
    lines.push(`${c.id.substring(0, 12)}   ${c.image.padEnd(12)}   ${c.status.padEnd(10)}  0.0.0.0:${c.port}`);
  }
  return lines;
}

function handleDockerImages() {
  const imgs = dockerImages();
  const lines = ['REPOSITORY          TAG         IMAGE ID       SIZE'];
  for (const img of imgs) {
    lines.push(`${img.repository.padEnd(18)}  ${img.tag.padEnd(10)}  ${img.id.substring(0, 12)}   ${img.size}`);
  }
  return lines;
}

function handleDockerLogs(subArgs) {
  const cid = subArgs[0];
  if (!cid) return ['Usage: docker logs <container>'];
  return dockerLogs(cid);
}

function handleDockerExec(subArgs) {
  const cid = subArgs.find((a) => !a.startsWith('-'));
  const cmd = subArgs.slice(subArgs.indexOf(cid) + 1).join(' ');
  return dockerExec(cid, cmd);
}

function handleDockerRename(subArgs) {
  if (subArgs.length < 2) return ['Usage: docker rename <old-name> <new-name>'];
  return [dockerRename(subArgs[0], subArgs[1]).message];
}

function handleDockerTag(subArgs) {
  if (subArgs.length < 2) return ['Usage: docker tag <source-image> <target-tag>'];
  return [dockerTag(subArgs[0], subArgs[1])];
}

function handleDockerCp(subArgs, vfs) {
  if (subArgs.length < 2) return ['Usage: docker cp <container>:<path> <host-path>'];
  return dockerCp(vfs, subArgs[0], subArgs[1]);
}

function handleDockerVolumeLs() {
  const vols = dockerVolumeLs();
  return ['DRIVER    VOLUME NAME', ...vols.map((v) => `${v.driver.padEnd(8)}  ${v.name}`)];
}

function handleDockerVolumeRm(name) {
  if (!name) return ['Usage: docker volume rm <volume>'];
  return [dockerVolumeRm(name).message];
}

function handleDockerNetworkLs() {
  const nets = dockerNetworkLs();
  return ['NETWORK ID     NAME      DRIVER', ...nets.map((n) => `${n.id.substring(0, 12)}   ${n.name.padEnd(8)}  ${n.driver}`)];
}

function handleDockerNetworkRm(name) {
  if (!name) return ['Usage: docker network rm <network>'];
  return [dockerNetworkRm(name).message];
}

function handleDockerNetworkConnect(subArgs) {
  if (subArgs.length < 2) return ['Usage: docker network connect <network> <container>'];
  return [dockerNetworkConnect(subArgs[0], subArgs[1])];
}

function handleDockerNetworkDisconnect(subArgs) {
  if (subArgs.length < 2) return ['Usage: docker network disconnect <network> <container>'];
  return [dockerNetworkDisconnect(subArgs[0], subArgs[1])];
}

// === DOCKER COMPOSE DISPATCHER ===
function handleDockerCompose(args, vfs) {
  const composeFile = 'docker-compose.yml';
  const catResult = vfs.cat(composeFile);
  if (!catResult.success) {
    return [`ERROR: Can't find a suitable configuration file. Tried: ${composeFile}`];
  }

  const { ast } = parseCompose(catResult.content);
  if (ast.errors.length > 0) {
    return ast.errors.map((e) => `ERROR: ${e.message}`);
  }

  const sub = args[0];
  if (sub === 'up') return generateComposeUpLogs(ast);
  if (sub === 'down') return generateComposeDownLogs(ast);
  if (sub === 'ps') return ['NAME              SERVICE   STATUS    PORTS', 'app-web-1         web       running   0.0.0.0:8080->8080/tcp'];
  if (sub === 'config') return catResult.content.split('\n');

  return ['docker compose: up, down, ps, config'];
}
