/**
 * App.jsx — Uygulamanın ana kabuğu
 *
 * SceneManager'ı render eder. Gelecekte üst bar (StatusBarsPanel),
 * zaman göstergesi ve global UI katmanları (modal, toast vb.) buraya eklenecek.
 */

import SceneManager from './components/SceneManager';
import './App.css';

export default function App() {
  return (
    <div className="app">
      {/* Faz 1'de StatusBarsPanel buraya eklenecek */}
      <main className="app__content">
        <SceneManager />
      </main>
    </div>
  );
}
