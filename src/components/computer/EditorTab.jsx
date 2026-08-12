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

// Dosya uzantısına göre ikon seçimi
export function getFileIcon(filename = '') {
  if (filename.includes('Dockerfile')) return '🐳';
  if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return '🐙';
  if (filename.endsWith('.json')) return '🌐';
  if (filename.endsWith('.md')) return '📝';
  if (filename.endsWith('.go')) return '🐹';
  if (filename.endsWith('.js') || filename.endsWith('.ts')) return '⚡';
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

export default function EditorTab({ initialFile }) {
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
    const newObj = { name, path: `/home/user/${name}`, content: '', savedContent: '' };
    globalVFS.touch(`/home/user/${name}`);

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

  // Gelişmiş Syntax Highlighting (9+ Dosya Türü)
  const getHighlightedContent = () => {
    if (!currentFile) return null;
    const ext = currentFile.name;

    return currentFile.content.split('\n').map((line, i) => {
      const trimmed = line.trimStart();
      let className = 'editor__line';

      if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
        className += ' editor__line--comment';
      } else if (ext.endsWith('.md')) {
        if (trimmed.startsWith('#')) className += ' editor__line--keyword';
        else if (trimmed.startsWith('>')) className += ' editor__line--comment';
      } else if (ext.endsWith('.json')) {
        if (/"[^"]+":/.test(trimmed)) className += ' editor__line--keyword';
      } else if (/^(FROM|RUN|COPY|WORKDIR|EXPOSE|CMD|ENTRYPOINT|ENV|ARG|func|package|import|const|let|var|function|return|export|default)\s/i.test(trimmed)) {
        className += ' editor__line--keyword';
      }

      return (
        <div key={i} className={className}>
          {line || '\u00A0'}
        </div>
      );
    });
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
              <TerminalTab />
            </div>
          </div>
        )}
      </div>

      {/* Durum çubuğu */}
      <div className="editor__statusbar">
        <span>{currentFile ? currentFile.name : ''}</span>
        <span>Satır: {lineCount}</span>
        <span>UTF-8</span>
        <span className="editor__statusbar-term-link" onClick={() => setShowTerminal(!showTerminal)}>
          {showTerminal ? '▼ Terminali Gizle' : '▲ Terminali Aç'}
        </span>
      </div>
    </div>
  );
}
