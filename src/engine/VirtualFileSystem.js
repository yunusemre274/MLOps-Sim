/**
 * VirtualFileSystem.js — Simüle Dosya Sistemi (Single Source of Truth VFS)
 *
 * Faz 13/17 / Round 3 Tek Kaynak Reaktivite Mimarisi:
 * tüm masaüstü simgeleri (/home/user/desktop/ altında .app ve dosyalar)
 * VFS ağacında saklanır. VFS üzerindeki herhangi bir mutasyonda (touch, mkdir, rm)
 * dinleyicilere (subscribers) haber verilir ve tüm arayüz bileşenleri (Desktop, Explorer, Editor, Terminal)
 * useVFS() hook'u üzerinden anında senkronize olur.
 */

const DEFAULT_DESKTOP_APPS = {
  'terminal':       { _type: 'app', appId: 'terminal',       label: 'Terminal',          name: 'Terminal',          icon: '⌨️', x: 20,  y: 20 },
  'explorer':       { _type: 'app', appId: 'explorer',       label: 'Dosya Gezgini',     name: 'Dosya Gezgini',     icon: '📁', x: 20,  y: 110 },
  'editor':         { _type: 'app', appId: 'editor',         label: 'Kod Editörü',       name: 'Kod Editörü',       icon: '📝', x: 20,  y: 200 },
  'chrome':         { _type: 'app', appId: 'browser_chrome', label: 'Google Chrome',    name: 'Google Chrome',    icon: '🌐', x: 20,  y: 290 },
  'edge':           { _type: 'app', appId: 'browser_edge',   label: 'Microsoft Edge',    name: 'Microsoft Edge',    icon: '🌐', x: 20,  y: 380 },
  'monitoring':     { _type: 'app', appId: 'monitoring',     label: 'Monitoring',        name: 'Monitoring',        icon: '📊', x: 120, y: 20 },
  'tutorials':      { _type: 'app', appId: 'tutorials',      label: 'Tutorial Hub',      name: 'Tutorial Hub',      icon: '📚', x: 120, y: 110 },
  'jobs':           { _type: 'app', appId: 'jobs',           label: 'İş Platformu',      name: 'İş Platformu',      icon: '💼', x: 120, y: 200 },
  'trash':          { _type: 'app', appId: 'trash',          label: 'Geri Dönüşüm',      name: 'Geri Dönüşüm',      icon: '🗑️', x: 120, y: 290 },
};

export default class VirtualFileSystem {
  constructor() {
    this.listeners = new Set();

    // Başlangıç dosya sistemi ağacı
    this.root = {
      _type: 'dir',
      children: {
        home: {
          _type: 'dir',
          children: {
            user: {
              _type: 'dir',
              children: {
                desktop: {
                  _type: 'dir',
                  children: { ...DEFAULT_DESKTOP_APPS },
                },
                projects: { _type: 'dir', children: {} },
                documents: { _type: 'dir', children: {} },
                '.bashrc': { _type: 'file', content: '# bash config\nexport PS1="$ "\n', date: 'Jan 12 08:00' },
              },
            },
          },
        },
        tmp: { _type: 'dir', children: {} },
      },
    };
    this.cwd = '/home/user';
  }

  reset() {
    this.root = {
      _type: 'dir',
      children: {
        home: {
          _type: 'dir',
          children: {
            user: {
              _type: 'dir',
              children: {
                desktop: {
                  _type: 'dir',
                  children: { ...DEFAULT_DESKTOP_APPS },
                },
                projects: { _type: 'dir', children: {} },
                documents: { _type: 'dir', children: {} },
                '.bashrc': { _type: 'file', content: '# bash config\nexport PS1="$ "\n', date: 'Jan 12 08:00' },
              },
            },
          },
        },
        tmp: { _type: 'dir', children: {} },
      },
    };
    this.cwd = '/home/user';
    this._notify();
  }

  // === Subscription API ===
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    this.listeners.forEach((cb) => {
      try { cb(); } catch (err) { console.error('VFS Listener error:', err); }
    });
  }

  /**
   * Bir görevin repo dosyalarını VFS'e /home/user/projects/<mission.id>/ olarak aktarır.
   */
  syncMission(mission) {
    if (!mission || !mission.id) return;
    const projectPath = `/home/user/projects/${mission.id}`;
    this.mkdir(projectPath, true);

    if (mission.repoFiles) {
      for (const [filename, content] of Object.entries(mission.repoFiles)) {
        this.writeFile(`${projectPath}/${filename}`, content);
      }
    }
  }

  /**
   * Yolu parçalarına ayırır ve normalize eder.
   */
  _resolvePath(path) {
    if (!path) return this.cwd.split('/').filter(Boolean);
    let parts;
    if (path.startsWith('/')) {
      parts = path.split('/').filter(Boolean);
    } else {
      parts = [...this.cwd.split('/').filter(Boolean), ...path.split('/').filter(Boolean)];
    }

    const resolved = [];
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') { resolved.pop(); continue; }
      resolved.push(part);
    }
    return resolved;
  }

  /**
   * Yoldaki düğümü getirir.
   */
  _getNode(path) {
    const parts = this._resolvePath(path);
    let current = this.root;

    for (const part of parts) {
      if (!current || current._type !== 'dir') return { node: null, found: false };
      let child = current.children[part];
      if (!child) {
        // Key eşleşmezse label veya name kontrol et
        const foundEntry = Object.values(current.children).find(
          (c) => c.label === part || c.name === part
        );
        if (foundEntry) child = foundEntry;
      }
      if (!child) return { node: null, found: false };
      current = child;
    }
    return { node: current, found: true };
  }

  /**
   * Üst dizin + isim döndürür.
   */
  _getParentAndName(path) {
    const parts = this._resolvePath(path);
    const name = parts.pop();
    let parent = this.root;
    for (const part of parts) {
      if (!parent || parent._type !== 'dir' || !parent.children[part]) {
        return { parent: null, name };
      }
      parent = parent.children[part];
    }
    return { parent, name };
  }

  // === Public VFS API ===

  pwd() {
    return this.cwd;
  }

  cd(path) {
    if (!path || path === '~') {
      this.cwd = '/home/user';
      this._notify();
      return { success: true };
    }
    const newParts = this._resolvePath(path);
    const newPath = '/' + newParts.join('/');
    const { node, found } = this._getNode(newPath);

    if (!found) {
      return { success: false, error: `cd: ${path}: Dizin bulunamadı` };
    }
    if (node._type === 'app') {
      const displayLabel = node.label || node.name || path;
      return { success: false, error: `cd: ${path}: Bu bir uygulama kısayolu, dizin değil. Açmak için: open "${displayLabel}".` };
    }
    if (node._type === 'file') {
      return { success: false, error: `cd: ${path}: Dizin değil` };
    }
    if (node._type !== 'dir') {
      return { success: false, error: `cd: ${path}: Dizin bulunamadı` };
    }
    this.cwd = newPath || '/';
    this._notify();
    return { success: true };
  }

  ls(path, options = {}) {
    const target = path || this.cwd;
    const { node, found } = this._getNode(target);

    if (!found || node._type !== 'dir') {
      return { success: false, error: `ls: ${target}: Dizin bulunamadı` };
    }

    const entries = Object.entries(node.children).map(([key, child]) => ({
      key,
      name: child.label || child.name || key,
      label: child.label || child.name || key,
      type: child._type,
      appId: child.appId || key,
      icon: child.icon,
      size: child.content ? child.content.length : (child._type === 'dir' ? 4096 : 1024),
      date: child.date || 'Jan 12 08:00',
      x: child.x,
      y: child.y,
    }));
    return { success: true, entries };
  }

  cat(path) {
    const { node, found } = this._getNode(path);
    if (!found) return { success: false, error: `cat: ${path}: Dosya bulunamadı` };
    if (node._type === 'app') return { success: false, error: `cat: ${path}: Bir uygulama kısayolu` };
    if (node._type !== 'file') return { success: false, error: `cat: ${path}: Bir dizin` };
    return { success: true, content: node.content };
  }

  mkdir(path, recursive = false) {
    const parts = this._resolvePath(path);
    let current = this.root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current.children[part]) {
        if (i < parts.length - 1 && !recursive) {
          return { success: false, error: `mkdir: ${path}: Üst dizin bulunamadı` };
        }
        current.children[part] = { _type: 'dir', children: {}, date: 'Jan 12 08:00' };
      }
      current = current.children[part];
    }
    this._notify();
    return { success: true };
  }

  touch(path) {
    const { parent, name } = this._getParentAndName(path);
    if (!parent || parent._type !== 'dir') {
      return { success: false, error: `touch: ${path}: Üst dizin bulunamadı` };
    }
    if (!parent.children[name]) {
      parent.children[name] = { _type: 'file', content: '', date: 'Jan 12 08:00' };
    }
    this._notify();
    return { success: true };
  }

  writeFile(path, content) {
    const { parent, name } = this._getParentAndName(path);
    if (!parent || parent._type !== 'dir') {
      return { success: false, error: `write: ${path}: Üst dizin bulunamadı` };
    }
    parent.children[name] = { _type: 'file', content, date: 'Jan 12 08:00' };
    this._notify();
    return { success: true };
  }

  rm(path, recursive = false) {
    const { parent, name } = this._getParentAndName(path);
    if (!parent || parent._type !== 'dir' || !parent.children[name]) {
      return { success: false, error: `rm: ${path}: Bulunamadı` };
    }
    const target = parent.children[name];
    if (target._type === 'dir' && !recursive) {
      return { success: false, error: `rm: ${name}: Bir dizin (-r kullanın)` };
    }
    delete parent.children[name];
    this._notify();
    return { success: true };
  }

  cp(srcPath, destPath) {
    const { node: srcNode } = this._getNode(srcPath);
    if (!srcNode) return { success: false, error: `cp: ${srcPath}: Dosya/dizin bulunamadı` };
    const content = srcNode._type === 'file' ? srcNode.content : '';
    if (srcNode._type === 'dir') {
      this.mkdir(destPath, true);
    } else {
      this.writeFile(destPath, content);
    }
    this._notify();
    return { success: true };
  }

  mv(srcPath, destPath) {
    const cpRes = this.cp(srcPath, destPath);
    if (!cpRes.success) return cpRes;
    this.rm(srcPath, true);
    this._notify();
    return { success: true };
  }

  grep(pattern, path) {
    const catRes = this.cat(path);
    if (!catRes.success) return catRes;
    const lines = catRes.content.split('\n').filter((l) => l.includes(pattern));
    return { success: true, lines };
  }

  echo(args) {
    const redirectIndex = args.indexOf('>');
    if (redirectIndex !== -1) {
      const text = args.slice(0, redirectIndex).join(' ');
      const file = args[redirectIndex + 1];
      if (!file) return { success: false, error: 'echo: hedef dosya belirtilmedi' };
      return this.writeFile(file, text + '\n');
    }
    return { success: true, output: args.join(' ') };
  }

  updateIconPosition(name, x, y) {
    const { node } = this._getNode(`/home/user/desktop/${name}`);
    if (node) {
      node.x = x;
      node.y = y;
      this._notify();
    }
  }

  tree(path, prefix = '') {
    const { node, found } = this._getNode(path || this.cwd);
    if (!found || node._type !== 'dir') return [];

    const lines = [];
    const entries = Object.entries(node.children);
    entries.forEach(([name, child], i) => {
      const isLast = i === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const icon = child._type === 'dir' ? '📁' : (child._type === 'app' ? '📱' : '📄');
      lines.push(`${prefix}${connector}${icon} ${name}`);
    });
    return lines;
  }
}

// Single Source of Truth VFS Singleton
export const globalVFS = new VirtualFileSystem();
