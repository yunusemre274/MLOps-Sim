/**
 * ComputerScene.jsx — Bilgisayar sahnesi
 *
 * Üç sekme: Terminal, Editör, Tarayıcı
 * Terminal: Komut satırı arayüzü (docker, git, ls, cd vb.)
 * Editör: Dockerfile/YAML düzenleme
 * Tarayıcı: localhost simülasyonu
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import TerminalTab from '../components/computer/TerminalTab';
import EditorTab from '../components/computer/EditorTab';
import BrowserTab from '../components/computer/BrowserTab';
import './ComputerScene.css';

const TABS = [
  { id: 'terminal', icon: '⌨️', label: 'Terminal' },
  { id: 'editor',   icon: '📝', label: 'Editör' },
  { id: 'browser',  icon: '🌐', label: 'Tarayıcı' },
];

export default function ComputerScene() {
  const setScene = useGameStore((s) => s.setScene);
  const [activeTab, setActiveTab] = useState('terminal');

  return (
    <div className="scene scene--computer">
      <div className="computer-header">
        <button className="computer-back" onClick={() => setScene('home')}>
          ← Eve Dön
        </button>
        <div className="computer-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`computer-tab ${activeTab === tab.id ? 'computer-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="computer-content">
        {activeTab === 'terminal' && <TerminalTab />}
        {activeTab === 'editor' && <EditorTab />}
        {activeTab === 'browser' && <BrowserTab />}
      </div>
    </div>
  );
}
