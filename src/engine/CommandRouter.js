/**
 * CommandRouter.js — Terminal komut yönlendiricisi
 *
 * Kullanıcının girdiği komutları parse edip ilgili engine'e yönlendirir.
 * Desteklenen komut aileleri: dosya sistemi, git, docker
 */

import { simulateDockerBuild, dockerRun, dockerStop, dockerPs, dockerPsAll } from './DockerSimulator.js';

/**
 * Bir komut satırını çalıştırır.
 * @param {string} input - Kullanıcının girdiği komut
 * @param {VirtualFileSystem} vfs - Sanal dosya sistemi instance'ı
 * @param {Object} gitState - Git durumu { initialized, staged, commits, branch }
 * @returns {string[]} Çıktı satırları
 */
export function executeCommand(input, vfs, gitState) {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd) {
    // === Dosya Sistemi ===
    case 'pwd':
      return [vfs.pwd()];

    case 'ls': {
      const result = vfs.ls(args[0]);
      if (!result.success) return [result.error];
      if (result.entries.length === 0) return ['(boş dizin)'];
      return result.entries.map((e) =>
        e.type === 'dir' ? `\x1b[34m${e.name}/\x1b[0m` : e.name
      );
    }

    case 'cd': {
      const result = vfs.cd(args[0]);
      return result.success ? [] : [result.error];
    }

    case 'cat': {
      if (!args[0]) return ['cat: dosya adı gerekli'];
      const result = vfs.cat(args[0]);
      return result.success ? result.content.split('\n') : [result.error];
    }

    case 'mkdir': {
      if (!args[0]) return ['mkdir: dizin adı gerekli'];
      const result = vfs.mkdir(args[0]);
      return result.success ? [] : [result.error];
    }

    case 'touch': {
      if (!args[0]) return ['touch: dosya adı gerekli'];
      const result = vfs.touch(args[0]);
      return result.success ? [] : [result.error];
    }

    case 'rm': {
      if (!args[0]) return ['rm: dosya/dizin adı gerekli'];
      const result = vfs.rm(args[0]);
      return result.success ? [] : [result.error];
    }

    case 'echo': {
      const result = vfs.echo(args);
      if (result.output !== undefined) return [result.output];
      return result.success ? [] : [result.error];
    }

    case 'tree': {
      const lines = vfs.tree(args[0]);
      return lines.length > 0 ? lines : ['(boş dizin)'];
    }

    // === Git Simülasyonu ===
    case 'git':
      return handleGit(args, vfs, gitState);

    // === Docker Simülasyonu ===
    case 'docker':
      return handleDocker(args, vfs);

    // === Yardım ===
    case 'help':
      return [
        'Kullanılabilir komutlar:',
        '  pwd, ls, cd, cat, mkdir, touch, rm, echo, tree',
        '  git init/clone/status/add/commit/push/pull/log',
        '  docker build/run/stop/ps',
        '  clear, help',
      ];

    case 'clear':
      return ['__CLEAR__']; // Terminal bileşeni bu özel değeri yakalar

    case 'whoami':
      return ['mlops-engineer'];

    case 'date':
      return [new Date().toLocaleString('tr-TR')];

    case 'uname':
      return ['MLOps-Sim Docker Engine v1.0 (simulated)'];

    default:
      return [`${cmd}: komut bulunamadı. 'help' yazarak kullanılabilir komutları görebilirsin.`];
  }
}

/**
 * Git komutları
 */
function handleGit(args, vfs, gitState) {
  const subcommand = args[0];

  switch (subcommand) {
    case 'init':
      if (gitState.initialized) return ['Reinitializing existing Git repository'];
      gitState.initialized = true;
      gitState.branch = 'main';
      gitState.commits = [];
      gitState.staged = [];
      vfs.mkdir('.git');
      return ['Initialized empty Git repository in ' + vfs.pwd() + '/.git/'];

    case 'clone': {
      const url = args[1];
      if (!url) return ['usage: git clone <repository>'];
      const repoName = url.split('/').pop()?.replace('.git', '') || 'repo';
      vfs.mkdir(repoName);
      gitState.initialized = true;
      gitState.branch = 'main';
      gitState.commits = [{ hash: 'a1b2c3d', message: 'Initial commit', author: 'remote' }];
      gitState.staged = [];
      return [
        `Cloning into '${repoName}'...`,
        'remote: Enumerating objects: 42, done.',
        'remote: Counting objects: 100% (42/42), done.',
        'remote: Compressing objects: 100% (30/30), done.',
        'Receiving objects: 100% (42/42), 12.5 KiB, done.',
      ];
    }

    case 'status':
      if (!gitState.initialized) return ['fatal: not a git repository'];
      return [
        `On branch ${gitState.branch}`,
        gitState.staged.length > 0
          ? `Changes to be committed:\n  ${gitState.staged.join('\n  ')}`
          : 'nothing to commit, working tree clean',
      ];

    case 'add': {
      if (!gitState.initialized) return ['fatal: not a git repository'];
      const file = args[1];
      if (!file) return ['Nothing specified, nothing added.'];
      if (file === '.' || file === '-A') {
        const ls = vfs.ls();
        if (ls.success) {
          gitState.staged = ls.entries.map((e) => e.name);
        }
      } else {
        if (!gitState.staged.includes(file)) {
          gitState.staged.push(file);
        }
      }
      return [];
    }

    case 'commit': {
      if (!gitState.initialized) return ['fatal: not a git repository'];
      if (gitState.staged.length === 0) return ['nothing to commit'];
      const msgIdx = args.indexOf('-m');
      const message = msgIdx !== -1 ? args.slice(msgIdx + 1).join(' ').replace(/"/g, '') : 'No message';
      const hash = Math.random().toString(16).slice(2, 9);
      gitState.commits.push({ hash, message, author: 'you' });
      const count = gitState.staged.length;
      gitState.staged = [];
      return [
        `[${gitState.branch} ${hash}] ${message}`,
        ` ${count} file(s) changed`,
      ];
    }

    case 'push':
      if (!gitState.initialized) return ['fatal: not a git repository'];
      return [
        `Enumerating objects: ${gitState.commits.length}, done.`,
        'Counting objects: 100%, done.',
        `To origin/${gitState.branch}`,
        '   a1b2c3d..f4e5d6c  main -> main',
      ];

    case 'pull':
      if (!gitState.initialized) return ['fatal: not a git repository'];
      return ['Already up to date.'];

    case 'log':
      if (!gitState.initialized) return ['fatal: not a git repository'];
      if (gitState.commits.length === 0) return ['No commits yet'];
      return gitState.commits.slice().reverse().map((c) =>
        `\x1b[33m${c.hash}\x1b[0m ${c.message} (${c.author})`
      );

    case 'branch':
      if (!gitState.initialized) return ['fatal: not a git repository'];
      return [`* ${gitState.branch}`];

    default:
      return [`git: '${subcommand}' is not a git command.`];
  }
}

/**
 * Docker komutları
 */
function handleDocker(args, vfs) {
  const subcommand = args[0];

  switch (subcommand) {
    case 'build': {
      const fileFlag = args.indexOf('-f');
      const dockerfilePath = fileFlag !== -1 ? args[fileFlag + 1] : 'Dockerfile';
      const result = simulateDockerBuild(vfs, dockerfilePath);
      return result.logs;
    }

    case 'run': {
      const image = args[args.length - 1] || 'app:latest';
      const portIdx = args.indexOf('-p');
      let port = 8080;
      if (portIdx !== -1 && args[portIdx + 1]) {
        const portMap = args[portIdx + 1].split(':');
        port = parseInt(portMap[0]) || 8080;
      }
      const result = dockerRun(image, { port });
      return [result.message];
    }

    case 'stop': {
      const cid = args[1];
      if (!cid) return ['Usage: docker stop <container_id>'];
      const result = dockerStop(cid);
      return [result.message];
    }

    case 'ps': {
      const all = args.includes('-a');
      const list = all ? dockerPsAll() : dockerPs();
      if (list.length === 0) return ['CONTAINER ID   IMAGE   STATUS   PORTS'];
      const lines = ['CONTAINER ID   IMAGE          STATUS      PORTS'];
      for (const c of list) {
        lines.push(`${c.id.substring(0, 12)}   ${c.image.padEnd(12)}   ${c.status.padEnd(10)}  0.0.0.0:${c.port}`);
      }
      return lines;
    }

    case 'images':
      return [
        'REPOSITORY   TAG       IMAGE ID       SIZE',
        'app          latest    a1b2c3d4e5f6   125MB',
      ];

    default:
      return [`docker: '${subcommand}' is not a docker command.`];
  }
}
