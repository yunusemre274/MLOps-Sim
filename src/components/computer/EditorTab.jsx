/**
 * EditorTab.jsx — Kod Editörü & Entegre Terminal Bileşeni (Faz 16 / GÖREV GRUBU 3)
 *
 * Özellikler:
 * - VSCode tarzı çoklu sekme (tab) yönetimi
 * - Değişiklik yapılan dosyalarda nokta (●) işareti (Unsaved/Dirty indicator)
 * - 9+ dosya türü için sözdizimi vurgulama & ikon desteği (.md, .txt, .json, .go, .js, .ts, .env, .yml, .gitignore, .sh, Dockerfile)
 * - Alt kısma gömülebilen açılır-kapanır Entegre Terminal Paneli (Component Reuse)
 */

import { useState, useRef, useEffect } from 'react';
import { globalVFS } from '../../engine/VirtualFileSystem';
import TerminalTab from './TerminalTab';
import './EditorTab.css';

// Dosya uzantısından dil modu seçimi
export const EXTENSION_TO_LANGUAGE = {
  '.py': 'python',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.go': 'go',
  '.json': 'json',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.md': 'markdown',
  '.txt': 'plaintext',
  '.env': 'shell',
  '.sh': 'shell',
  'Dockerfile': 'dockerfile',
  '.gitignore': 'plaintext',
};

export function getFileLanguage(filename = '') {
  if (filename === 'Dockerfile' || filename.startsWith('Dockerfile.') || filename.endsWith('.dockerfile')) {
    return 'dockerfile';
  }
  const dotIdx = filename.lastIndexOf('.');
  if (dotIdx !== -1) {
    const ext = filename.substring(dotIdx);
    if (EXTENSION_TO_LANGUAGE[ext]) return EXTENSION_TO_LANGUAGE[ext];
  }
  return 'plaintext';
}

// Dosya uzantısına göre ikon seçimi
export function getFileIcon(filename = '') {
  if (filename.includes('Dockerfile')) return '🐳';
  if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return '🐙';
  if (filename.endsWith('.json')) return '🌐';
  if (filename.endsWith('.md')) return '📝';
  if (filename.endsWith('.go')) return '🐹';
  if (filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.jsx') || filename.endsWith('.tsx')) return '⚡';
  if (filename.endsWith('.env')) return '🔑';
  if (filename.endsWith('.gitignore')) return '🙈';
  if (filename.endsWith('.sh')) return '🐚';
  if (filename.endsWith('.txt')) return '📄';
  return '📄';
}

const DEFAULT_DOCKERFILE = `# MLOps Projesi Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["python", "app.py"]
`;

// === TOKEN BAZLI SYNTAX HIGHLIGHTING MOTORU ===

function renderHighlightedLine(line, lang) {
  if (!line) return '\u00A0';
  const trimmed = line.trimStart();

  // Yorum satırları (tüm diller için)
  if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
    return <span className="tok-comment">{line}</span>;
  }

  // 1. YAML / DOCKER-COMPOSE
  if (lang === 'yaml') {
    const indent = line.length - trimmed.length;
    const indentStr = line.substring(0, indent);

    // Liste elemanı (- "80:80" veya - db)
    const listMatch = trimmed.match(/^-\s+(.*)$/);
    if (listMatch) {
      return (
        <>
          {indentStr}
          <span className="tok-punct">- </span>
          <span className={/["']/.test(listMatch[1]) ? 'tok-string' : 'tok-value'}>{listMatch[1]}</span>
        </>
      );
    }

    // Key: value eşleşmesi
    const kvMatch = trimmed.match(/^([a-zA-Z0-9_\-\.]+):(?:\s*(.*))?$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const val = kvMatch[2];
      const isTopLevel = indent === 0;
      const isServiceName = indent === 2;

      let keyClass = 'tok-property';
      if (isTopLevel) keyClass = 'tok-toplevel';
      else if (isServiceName) keyClass = 'tok-servicename';

      let valNode = null;
      if (val !== undefined && val !== '') {
        if (/^["'].*["']$/.test(val)) valNode = <span className="tok-string"> {val}</span>;
        else if (/^\d+$/.test(val)) valNode = <span className="tok-number"> {val}</span>;
        else if (val === 'true' || val === 'false') valNode = <span className="tok-builtin"> {val}</span>;
        else valNode = <span className="tok-value"> {val}</span>;
      }

      return (
        <>
          {indentStr}
          <span className={keyClass}>{key}</span>
          <span className="tok-punct">:</span>
          {valNode}
        </>
      );
    }
  }

  // 2. DOCKERFILE
  if (lang === 'dockerfile') {
    const dfMatch = line.match(/^(\s*)(FROM|RUN|COPY|ADD|WORKDIR|EXPOSE|CMD|ENTRYPOINT|ENV|ARG|USER|LABEL|HEALTHCHECK|VOLUME|SHELL|STOPSIGNAL|ONBUILD)(\b.*)$/i);
    if (dfMatch) {
      const [, sp, dir, rest] = dfMatch;
      // AS alias veya flag parçalama
      const parts = rest.split(/(\s+AS\s+\S+|--[a-zA-Z0-9_\-]+(?:=\S+)?|-[a-zA-Z0-9])/g);
      return (
        <>
          {sp}
          <span className="tok-directive">{dir.toUpperCase()}</span>
          {parts.map((p, idx) => {
            if (/^\s+AS\s+/i.test(p)) {
              const aliasName = p.trim().split(/\s+/)[1];
              return (
                <span key={idx}>
                  {' '}
                  <span className="tok-keyword">AS</span> <span className="tok-servicename">{aliasName}</span>
                </span>
              );
            }
            if (/^(--[a-zA-Z0-9_\-]+|-[a-zA-Z0-9])/.test(p)) {
              return <span key={idx} className="tok-flag">{p}</span>;
            }
            if (/["'].*["']/.test(p)) {
              return <span key={idx} className="tok-string">{p}</span>;
            }
            return <span key={idx}>{p}</span>;
          })}
        </>
      );
    }
  }

  // 3. PYTHON
  if (lang === 'python') {
    if (trimmed.startsWith('@')) {
      return <span className="tok-decorator">{line}</span>;
    }
    const pyRegex = /(\b(?:def|class|import|from|return|if|else|elif|for|while|try|except|finally|with|as|pass|yield|raise|async|await|lambda|in|is|not|and|or|assert)\b|\b(?:True|False|None|print|len|range|dict|list|str|int|float|bool|open)\b|"[^"]*"|'[^']*'|#[^\n]*)/g;
    const tokens = line.split(pyRegex);
    return (
      <>
        {tokens.map((tok, idx) => {
          if (!tok) return null;
          if (tok.startsWith('#')) return <span key={idx} className="tok-comment">{tok}</span>;
          if (tok.startsWith('"') || tok.startsWith("'")) return <span key={idx} className="tok-string">{tok}</span>;
          if (/^(def|class|import|from|return|if|else|elif|for|while|try|except|finally|with|as|pass|yield|raise|async|await|lambda|in|is|not|and|or|assert)$/.test(tok)) {
            return <span key={idx} className="tok-keyword">{tok}</span>;
          }
          if (/^(True|False|None|print|len|range|dict|list|str|int|float|bool|open)$/.test(tok)) {
            return <span key={idx} className="tok-builtin">{tok}</span>;
          }
          return <span key={idx}>{tok}</span>;
        })}
      </>
    );
  }

  // 4. MARKDOWN
  if (lang === 'markdown') {
    if (trimmed.startsWith('# ')) return <span className="tok-h1">{line}</span>;
    if (trimmed.startsWith('## ')) return <span className="tok-h2">{line}</span>;
    if (trimmed.startsWith('### ')) return <span className="tok-h3">{line}</span>;
    if (trimmed.startsWith('>')) return <span className="tok-quote">{line}</span>;
    if (/^(\s*)([-*]|\d+\.)\s+/.test(line)) {
      const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
      return (
        <>
          {match[1]}
          <span className="tok-bullet">{match[2]} </span>
          <span>{match[3]}</span>
        </>
      );
    }
  }

  // 5. JSON
  if (lang === 'json') {
    const jsonMatch = line.match(/^(\s*)(".*?")(\s*:\s*)(.*)$/);
    if (jsonMatch) {
      return (
        <>
          {jsonMatch[1]}
          <span className="tok-property">{jsonMatch[2]}</span>
          <span className="tok-punct">{jsonMatch[3]}</span>
          <span className={jsonMatch[4].startsWith('"') ? 'tok-string' : 'tok-number'}>{jsonMatch[4]}</span>
        </>
      );
    }
  }

  // Varsayılan satır
  return <span>{line}</span>;
}

// === GÖREV 2: IDE YAZIM KOLAYLIKLARI (Round 11) ===
export function processEditorKeyPress(content = '', start = 0, end = 0, key = '') {
  const PAIRS = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`',
  };
  const CLOSING_CHARS = new Set([')', ']', '}', '"', "'", '`']);

  // 1. Otomatik Kapanan Parantez ve Tırnaklar (autoClosingBrackets, autoClosingQuotes, autoSurround)
  if (PAIRS[key]) {
    const openChar = key;
    const closeChar = PAIRS[openChar];

    // Type-over: Eğer imleç zaten aynı tırnak/parantez önündeyse ve tekrar o tuşa basıldıysa
    if (start === end && content[start] === openChar && (openChar === '"' || openChar === "'" || openChar === '`')) {
      return {
        handled: true,
        type: 'type_over',
        newContent: content,
        newStart: start + 1,
        newEnd: start + 1,
      };
    }

    const selectedText = content.slice(start, end);
    const newContent = content.slice(0, start) + openChar + selectedText + closeChar + content.slice(end);
    const newCursor = start === end ? start + 1 : start + 1;
    return {
      handled: true,
      type: 'insert_pair',
      newContent,
      newStart: newCursor,
      newEnd: start === end ? newCursor : end + 1,
    };
  }

  // 2. Type-Over (Zaten kapanmış parantezin önünde kapanış tuşuna basıldığında atla)
  if (CLOSING_CHARS.has(key) && start === end && content[start] === key) {
    return {
      handled: true,
      type: 'type_over',
      newContent: content,
      newStart: start + 1,
      newEnd: start + 1,
    };
  }

  // 3. Çift Karakter Backspace (Boş () / [] / {} / "" / '' silme)
  if (key === 'Backspace' && start === end && start > 0) {
    const prevChar = content[start - 1];
    const nextChar = content[start];
    if (PAIRS[prevChar] && PAIRS[prevChar] === nextChar) {
      const newContent = content.slice(0, start - 1) + content.slice(start + 1);
      return {
        handled: true,
        type: 'delete_pair',
        newContent,
        newStart: start - 1,
        newEnd: start - 1,
      };
    }
  }

  // 4. Tab Tuşu ile Girinti (2 boşluk)
  if (key === 'Tab') {
    const newContent = content.slice(0, start) + '  ' + content.slice(end);
    return {
      handled: true,
      type: 'tab_indent',
      newContent,
      newStart: start + 2,
      newEnd: start + 2,
    };
  }

  return { handled: false, newContent: content, newStart: start, newEnd: end };
}

export default function EditorTab({ initialFile, initialPath = null }) {
  const [files, setFiles] = useState(() => {
    if (initialFile && initialFile.name) {
      return [{
        name: initialFile.name,
        path: initialFile.path || initialFile.name,
        content: initialFile.content ?? '',
        savedContent: initialFile.content ?? '',
      }];
    }
    return [{
      name: 'Dockerfile',
      path: '/home/user/projects/sample/Dockerfile',
      content: DEFAULT_DOCKERFILE,
      savedContent: DEFAULT_DOCKERFILE,
    }];
  });

  const [activeFile, setActiveFile] = useState(0);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const textareaRef = useRef(null);

  // Dosya gezgininden yeni dosya açıldığında
  useEffect(() => {
    if (initialFile && initialFile.name) {
      setFiles((prev) => {
        const existingIdx = prev.findIndex((f) => f.name === initialFile.name);
        if (existingIdx !== -1) {
          setActiveFile(existingIdx);
          return prev;
        }
        const newFileObj = {
          name: initialFile.name,
          path: initialFile.path || initialFile.name,
          content: initialFile.content ?? '',
          savedContent: initialFile.content ?? '',
        };
        const updated = [...prev, newFileObj];
        setActiveFile(updated.length - 1);
        return updated;
      });
    }
  }, [initialFile]);

  const currentFile = files[activeFile] || files[0];

  const handleContentChange = (e) => {
    const val = e.target.value;
    setFiles((prev) => {
      const updated = [...prev];
      updated[activeFile] = { ...updated[activeFile], content: val };
      return updated;
    });
  };

  const handleSave = () => {
    if (!currentFile) return;
    const filePath = currentFile.path || currentFile.name;
    globalVFS.writeFile(filePath, currentFile.content);

    setFiles((prev) => {
      const updated = [...prev];
      updated[activeFile] = { ...updated[activeFile], savedContent: currentFile.content };
      return updated;
    });
  };

  const handleNewFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    const activeDir = currentFile?.path ? currentFile.path.split('/').slice(0, -1).join('/') : globalVFS.pwd();
    const fullPath = `${activeDir}/${name}`.replace(/\/+/g, '/');
    const newObj = { name, path: fullPath, content: '', savedContent: '' };
    globalVFS.touch(fullPath);

    setFiles((prev) => [...prev, newObj]);
    setActiveFile(files.length);
    setNewFileName('');
    setShowNewFile(false);
  };

  const handleCloseTab = (e, index) => {
    e.stopPropagation();
    if (files.length <= 1) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (activeFile >= index && activeFile > 0) {
      setActiveFile(activeFile - 1);
    }
  };

  // Satır numaraları
  const lineCount = currentFile ? currentFile.content.split('\n').length : 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const currentLang = currentFile ? getFileLanguage(currentFile.name) : 'plaintext';

  // Gelişmiş Token Tabanlı Syntax Highlighting (YAML, Dockerfile, Python, Markdown, JSON, Go, JS, Shell)
  const getHighlightedContent = () => {
    if (!currentFile) return null;

    return currentFile.content.split('\n').map((line, i) => (
      <div key={i} className="editor__line">
        {renderHighlightedLine(line, currentLang)}
      </div>
    ));
  };

  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea || !currentFile) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = currentFile.content;

    const res = processEditorKeyPress(content, start, end, e.key);
    if (res.handled) {
      e.preventDefault();
      if (res.newContent !== content) {
        setFiles((prev) => {
          const updated = [...prev];
          updated[activeFile] = { ...updated[activeFile], content: res.newContent };
          return updated;
        });
      }
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(res.newStart, res.newEnd);
        }
      }, 0);
      return;
    }

    // Ctrl+S / Cmd+S ile Kaydet
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="editor">
      {/* Dosya sekmeleri */}
      <div className="editor__tabs">
        {files.map((file, i) => {
          const isDirty = file.content !== file.savedContent;
          return (
            <button
              key={i}
              className={`editor__file-tab ${i === activeFile ? 'editor__file-tab--active' : ''}`}
              onClick={() => setActiveFile(i)}
            >
              <span>{getFileIcon(file.name)} {file.name}</span>
              {isDirty && <span className="editor__dirty-dot" title="Kaydedilmemiş değişiklik">●</span>}
              {files.length > 1 && (
                <span className="editor__close-tab" onClick={(e) => handleCloseTab(e, i)}>✕</span>
              )}
            </button>
          );
        })}
        <button className="editor__new-file" onClick={() => setShowNewFile(true)}>
          + Yeni Dosya
        </button>
        <button className={`editor__toggle-term ${showTerminal ? 'editor__toggle-term--active' : ''}`} onClick={() => setShowTerminal(!showTerminal)}>
          💻 Terminal
        </button>
        <button className="editor__save" onClick={handleSave}>
          💾 Kaydet
        </button>
      </div>

      {showNewFile && (
        <div className="editor__new-file-row">
          <input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="ornek.py, README.md, config.json..."
            onKeyDown={(e) => e.key === 'Enter' && handleNewFile()}
            autoFocus
          />
          <button onClick={handleNewFile}>Oluştur</button>
          <button onClick={() => setShowNewFile(false)}>İptal</button>
        </div>
      )}

      {/* Editör ana gövdesi */}
      <div className="editor__main-container">
        <div className="editor__body">
          <div className="editor__gutter">
            {lineNumbers.map((n) => (
              <div key={n} className="editor__line-number">{n}</div>
            ))}
          </div>
          <div className="editor__content-wrapper">
            <div className="editor__highlight">
              {getHighlightedContent()}
            </div>
            <textarea
              ref={textareaRef}
              className="editor__textarea"
              value={currentFile ? currentFile.content : ''}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Entegre Terminal Paneli (VSCode Stili Alt Panel) */}
        {showTerminal && (
          <div className="editor__terminal-panel">
            <div className="editor__terminal-header">
              <span>💻 Entegre Terminal (VSCode)</span>
              <button onClick={() => setShowTerminal(false)}>✕ Kapama</button>
            </div>
            <div className="editor__terminal-body">
              <TerminalTab initialPath={initialPath} />
            </div>
          </div>
        )}
      </div>

      {/* Durum çubuğu */}
      <div className="editor__statusbar">
        <span>{currentFile ? currentFile.name : ''}</span>
        <span>Dil: {currentLang.toUpperCase()}</span>
        <span>Satır: {lineCount}</span>
        <span>UTF-8</span>
        <span className="editor__statusbar-term-link" onClick={() => setShowTerminal(!showTerminal)}>
          {showTerminal ? '▼ Terminali Gizle' : '▲ Terminali Aç'}
        </span>
      </div>
    </div>
  );
}
