/**
 * EditorTab.jsx — Kod editörü bileşeni
 *
 * Monaco Editor yerine custom textarea tabanlı editör.
 * VirtualFileSystem'deki dosyaları açar, düzenler, kaydeder.
 * Dockerfile ve YAML için temel syntax highlighting sağlar.
 */

import { useState, useRef, useEffect } from 'react';
import VirtualFileSystem from '../../engine/VirtualFileSystem';
import './EditorTab.css';

// Dosya sistemi singleton (TerminalTab ile paylaşılacak — şimdilik bağımsız)
const vfs = new VirtualFileSystem();

// Başlangıç dosyası
const DEFAULT_DOCKERFILE = `# MLOps Projesi Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["python", "app.py"]
`;

export default function EditorTab() {
  const [files, setFiles] = useState([
    { name: 'Dockerfile', content: DEFAULT_DOCKERFILE },
  ]);
  const [activeFile, setActiveFile] = useState(0);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const textareaRef = useRef(null);

  const currentFile = files[activeFile];

  const handleContentChange = (e) => {
    const updated = [...files];
    updated[activeFile] = { ...updated[activeFile], content: e.target.value };
    setFiles(updated);
  };

  const handleSave = () => {
    // VFS'ye kaydet
    vfs.writeFile(currentFile.name, currentFile.content);
  };

  const handleNewFile = () => {
    if (!newFileName.trim()) return;
    setFiles((prev) => [...prev, { name: newFileName.trim(), content: '' }]);
    setActiveFile(files.length);
    setNewFileName('');
    setShowNewFile(false);
  };

  // Satır numaraları
  const lineCount = currentFile.content.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Basit syntax highlighting (Dockerfile)
  const getHighlightedContent = () => {
    return currentFile.content.split('\n').map((line, i) => {
      const trimmed = line.trimStart();
      let className = 'editor__line';

      if (trimmed.startsWith('#')) className += ' editor__line--comment';
      else if (/^(FROM|RUN|COPY|WORKDIR|EXPOSE|CMD|ENTRYPOINT|ENV|ARG|USER|ADD|VOLUME|LABEL|HEALTHCHECK|SHELL|STOPSIGNAL|ONBUILD)\s/i.test(trimmed)) {
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
        {files.map((file, i) => (
          <button
            key={i}
            className={`editor__file-tab ${i === activeFile ? 'editor__file-tab--active' : ''}`}
            onClick={() => setActiveFile(i)}
          >
            📄 {file.name}
          </button>
        ))}
        <button className="editor__new-file" onClick={() => setShowNewFile(true)}>
          + Yeni Dosya
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
            placeholder="dosya_adi.ext"
            onKeyDown={(e) => e.key === 'Enter' && handleNewFile()}
            autoFocus
          />
          <button onClick={handleNewFile}>Oluştur</button>
          <button onClick={() => setShowNewFile(false)}>İptal</button>
        </div>
      )}

      {/* Editör alanı */}
      <div className="editor__body">
        <div className="editor__gutter">
          {lineNumbers.map((n) => (
            <div key={n} className="editor__line-number">{n}</div>
          ))}
        </div>
        <div className="editor__content-wrapper">
          {/* Syntax highlight overlay */}
          <div className="editor__highlight">
            {getHighlightedContent()}
          </div>
          {/* Gerçek textarea */}
          <textarea
            ref={textareaRef}
            className="editor__textarea"
            value={currentFile.content}
            onChange={handleContentChange}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Durum çubuğu */}
      <div className="editor__statusbar">
        <span>{currentFile.name}</span>
        <span>Satır: {lineCount}</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
