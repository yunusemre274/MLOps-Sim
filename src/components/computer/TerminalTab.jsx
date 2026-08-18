/**
 * TerminalTab.jsx — Terminal bileşeni
 *
 * xterm.js yerine custom terminal — oyunun 1D simülasyon konseptine uygun.
 * VirtualFileSystem + CommandRouter kullanır.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { globalVFS } from '../../engine/VirtualFileSystem';
import { executeCommand } from '../../engine/CommandRouter';
import './TerminalTab.css';

export default function TerminalTab({ initialPath = null }) {
  const vfs = globalVFS;
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    if (initialPath) {
      vfs.cd(initialPath);
    }
  }, [initialPath]);

  const [history, setHistory] = useState([
    { type: 'system', text: 'MLOps-Sim Terminal v1.0' },
    { type: 'system', text: "Yardım için 'help' yazın." },
    { type: 'system', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // Otomatik scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  // Focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // Komut geçmişine ekle
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    // Prompt satırı ekle
    const prompt = `\x1b[32m${vfs.pwd()}\x1b[0m $ ${trimmed}`;
    const newLines = [{ type: 'input', text: prompt }];

    // Komutu çalıştır (VFS-tabanlı merkezi senkronizasyon)
    const output = executeCommand(trimmed, vfs);

    // Clear özel komutu
    if (output.length === 1 && output[0] === '__CLEAR__') {
      setHistory([]);
      setInput('');
      return;
    }

    for (const line of output) {
      newLines.push({ type: 'output', text: line });
    }

    setHistory((prev) => [...prev, ...newLines]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    // Yukarı/aşağı ok — komut geçmişi
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(newIdx);
      setInput(cmdHistory[newIdx]);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const newIdx = historyIdx + 1;
      if (newIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    }
  };

  /**
   * ANSI renk kodlarını HTML span'larına dönüştürür.
   */
  const renderLine = (text) => {
    const parts = text.split(/\x1b\[(\d+)m/);
    const spans = [];
    let currentColor = null;

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        // ANSI kodu
        const code = parseInt(parts[i]);
        if (code === 0) currentColor = null;
        else if (code === 31) currentColor = 'var(--color-error)';
        else if (code === 32) currentColor = 'var(--color-success)';
        else if (code === 33) currentColor = 'var(--color-warning)';
        else if (code === 34) currentColor = 'var(--color-accent)';
      } else {
        if (parts[i]) {
          spans.push(
            <span key={i} style={currentColor ? { color: currentColor } : undefined}>
              {parts[i]}
            </span>
          );
        }
      }
    }
    return spans;
  };

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal__output" ref={outputRef}>
        {history.map((line, i) => (
          <div key={i} className={`terminal__line terminal__line--${line.type}`}>
            {renderLine(line.text)}
          </div>
        ))}
      </div>

      <form className="terminal__input-row" onSubmit={handleSubmit}>
        <span className="terminal__prompt">
          {renderLine(`\x1b[32m${vfs.pwd()}\x1b[0m $`)}
        </span>
        <input
          ref={inputRef}
          className="terminal__input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}
