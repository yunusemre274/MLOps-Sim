/**
 * VirtualFileSystem.js — Simüle dosya sistemi
 *
 * Oyun içi terminal için sanal bir dosya sistemi sağlar.
 * Gerçek bir dosya sistemi DEĞİLDİR — tüm veriler bellekte tutulur.
 *
 * Yapı: iç içe obje ağacı
 * - Dizin: { _type: 'dir', children: { ... } }
 * - Dosya: { _type: 'file', content: '...' }
 */

export default class VirtualFileSystem {
  constructor() {
    // Başlangıç dosya sistemi
    this.root = {
      _type: 'dir',
      children: {
        home: {
          _type: 'dir',
          children: {
            user: {
              _type: 'dir',
              children: {
                projects: { _type: 'dir', children: {} },
                '.bashrc': { _type: 'file', content: '# bash config\nexport PS1="$ "\n' },
              },
            },
          },
        },
        tmp: { _type: 'dir', children: {} },
      },
    };
    this.cwd = '/home/user';
  }

  /**
   * Yolu parçalarına ayırır ve normalize eder.
   * @param {string} path - Mutlak veya göreceli yol
   * @returns {string[]} Parça dizisi
   */
  _resolvePath(path) {
    let parts;
    if (path.startsWith('/')) {
      parts = path.split('/').filter(Boolean);
    } else {
      parts = [...this.cwd.split('/').filter(Boolean), ...path.split('/').filter(Boolean)];
    }

    // '..' ve '.' çözümle
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
   * @returns {{ node: Object, found: boolean }}
   */
  _getNode(path) {
    const parts = this._resolvePath(path);
    let current = this.root;

    for (const part of parts) {
      if (!current || current._type !== 'dir' || !current.children[part]) {
        return { node: null, found: false };
      }
      current = current.children[part];
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

  // === Public API ===

  pwd() {
    return this.cwd;
  }

  cd(path) {
    if (!path || path === '~') {
      this.cwd = '/home/user';
      return { success: true };
    }
    const newParts = this._resolvePath(path);
    const newPath = '/' + newParts.join('/');
    const { node, found } = this._getNode(newPath);

    if (!found || node._type !== 'dir') {
      return { success: false, error: `cd: ${path}: Dizin bulunamadı` };
    }
    this.cwd = newPath || '/';
    return { success: true };
  }

  ls(path) {
    const target = path || this.cwd;
    const { node, found } = this._getNode(target);

    if (!found || node._type !== 'dir') {
      return { success: false, error: `ls: ${target}: Dizin bulunamadı` };
    }

    const entries = Object.entries(node.children).map(([name, child]) => ({
      name,
      type: child._type,
    }));
    return { success: true, entries };
  }

  cat(path) {
    const { node, found } = this._getNode(path);
    if (!found) return { success: false, error: `cat: ${path}: Dosya bulunamadı` };
    if (node._type !== 'file') return { success: false, error: `cat: ${path}: Bir dizin` };
    return { success: true, content: node.content };
  }

  mkdir(path) {
    const { parent, name } = this._getParentAndName(path);
    if (!parent || parent._type !== 'dir') {
      return { success: false, error: `mkdir: ${path}: Üst dizin bulunamadı` };
    }
    if (parent.children[name]) {
      return { success: false, error: `mkdir: ${path}: Zaten mevcut` };
    }
    parent.children[name] = { _type: 'dir', children: {} };
    return { success: true };
  }

  touch(path) {
    const { parent, name } = this._getParentAndName(path);
    if (!parent || parent._type !== 'dir') {
      return { success: false, error: `touch: ${path}: Üst dizin bulunamadı` };
    }
    if (!parent.children[name]) {
      parent.children[name] = { _type: 'file', content: '' };
    }
    return { success: true };
  }

  writeFile(path, content) {
    const { parent, name } = this._getParentAndName(path);
    if (!parent || parent._type !== 'dir') {
      return { success: false, error: `write: ${path}: Üst dizin bulunamadı` };
    }
    parent.children[name] = { _type: 'file', content };
    return { success: true };
  }

  rm(path) {
    const { parent, name } = this._getParentAndName(path);
    if (!parent || parent._type !== 'dir' || !parent.children[name]) {
      return { success: false, error: `rm: ${path}: Bulunamadı` };
    }
    delete parent.children[name];
    return { success: true };
  }

  echo(args) {
    // "echo hello > file.txt" desteği
    const redirectIndex = args.indexOf('>');
    if (redirectIndex !== -1) {
      const text = args.slice(0, redirectIndex).join(' ');
      const file = args[redirectIndex + 1];
      if (!file) return { success: false, error: 'echo: hedef dosya belirtilmedi' };
      return this.writeFile(file, text + '\n');
    }
    return { success: true, output: args.join(' ') };
  }

  /**
   * Bir dizin altında dosya ağacını döndürür (tree komutu).
   */
  tree(path, prefix = '') {
    const { node, found } = this._getNode(path || this.cwd);
    if (!found || node._type !== 'dir') return [];

    const lines = [];
    const entries = Object.entries(node.children);
    entries.forEach(([name, child], i) => {
      const isLast = i === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const icon = child._type === 'dir' ? '📁' : '📄';
      lines.push(`${prefix}${connector}${icon} ${name}`);
      if (child._type === 'dir') {
        const childPrefix = prefix + (isLast ? '    ' : '│   ');
        // Recursive tree — inline
        const childEntries = Object.entries(child.children);
        childEntries.forEach(([cName, cChild], j) => {
          const cIsLast = j === childEntries.length - 1;
          const cConnector = cIsLast ? '└── ' : '├── ';
          const cIcon = cChild._type === 'dir' ? '📁' : '📄';
          lines.push(`${childPrefix}${cConnector}${cIcon} ${cName}`);
        });
      }
    });
    return lines;
  }
}
