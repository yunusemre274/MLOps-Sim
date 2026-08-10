/**
 * ComputerScene.jsx — Bilgisayar sahnesi
 *
 * Beş sekme: Terminal, Editör, Tarayıcı, Eğitimler, İş Platformu
 */

import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import TerminalTab from '../components/computer/TerminalTab';
import EditorTab from '../components/computer/EditorTab';
import BrowserTab from '../components/computer/BrowserTab';
import TutorialHub from '../components/computer/TutorialHub';
import './ComputerScene.css';

const TABS = [
  { id: 'terminal',  icon: '⌨️', label: 'Terminal' },
  { id: 'editor',    icon: '📝', label: 'Editör' },
  { id: 'browser',   icon: '🌐', label: 'Tarayıcı' },
  { id: 'tutorials', icon: '📚', label: 'Eğitimler' },
  { id: 'jobs',      icon: '💼', label: 'İş Bul' },
];

export default function ComputerScene() {
  const setScene = useGameStore((s) => s.setScene);
  const [activeTab, setActiveTab] = useState('terminal');

  // İş platformu bağımsız sahne olarak açılır
  const handleTabClick = (tabId) => {
    if (tabId === 'jobs') {
      setScene('jobplatform');
      return;
    }
    setActiveTab(tabId);
  };

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
              onClick={() => handleTabClick(tab.id)}
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
        {activeTab === 'tutorials' && <TutorialHub />}
      </div>
    </div>
  );
}
