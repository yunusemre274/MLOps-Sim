/**
 * App.jsx — Uygulamanın ana kabuğu
 *
 * StatusBarsPanel (üst panel) + SceneManager (aktif sahne) render eder.
 * Gelecekte global UI katmanları (modal, toast vb.) buraya eklenecek.
 */

import SceneManager from './components/SceneManager';
import StatusBarsPanel from './components/StatusBarsPanel';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <StatusBarsPanel />
      <main className="app__content">
        <SceneManager />
      </main>
    </div>
  );
}
