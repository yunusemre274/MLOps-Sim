/**
 * BrowserTab.jsx — Oyun içi tarayıcı bileşeni
 *
 * localhost:PORT simülasyonu — container çalışıyorsa başarı sayfası,
 * çalışmıyorsa bağlantı hatası gösterir.
 */

import { useState } from 'react';
import { dockerPs } from '../../engine/DockerSimulator';
import './BrowserTab.css';

export default function BrowserTab({ browserName = 'Chrome' }) {
  const [url, setUrl] = useState('http://localhost:8080');
  const [navigated, setNavigated] = useState(false);

  const handleNavigate = (e) => {
    e?.preventDefault();
    setNavigated(true);
  };

  // Çalışan container'ları kontrol et
  const runningContainers = dockerPs();
  const port = parseInt(url.split(':').pop()) || 8080;
  const matchingContainer = runningContainers.find((c) => c.port === port);

  return (
    <div className="browser">
      <form className="browser__toolbar" onSubmit={handleNavigate}>
        <span className="browser__brand-tag">{browserName === 'Edge' ? '🟦 Edge' : '🔴 Chrome'}</span>
        <button type="button" className="browser__nav-btn" disabled>←</button>
        <button type="button" className="browser__nav-btn" disabled>→</button>
        <button type="button" className="browser__nav-btn" onClick={() => setNavigated(true)}>↻</button>
        <div className="browser__url-bar">
          <span className="browser__lock">🔒</span>
          <input
            className="browser__url-input"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setNavigated(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
          />
        </div>
      </form>

      <div className="browser__viewport">
        {!navigated ? (
          <div className="browser__empty">
            <span>🌐</span>
            <p>Bir URL girin ve Enter'a basın</p>
          </div>
        ) : matchingContainer ? (
          <div className="browser__success">
            <div className="browser__success-icon">✅</div>
            <h2>Uygulama Çalışıyor!</h2>
            <p className="browser__success-detail">
              Container <code>{matchingContainer.id.substring(0, 12)}</code> port {port}'da aktif
            </p>
            <div className="browser__app-preview">
              <div className="browser__app-header">
                <span>🚀</span> MLOps App — Running
              </div>
              <div className="browser__app-body">
                <p>Status: <span style={{color: '#a6e3a1'}}>● Healthy</span></p>
                <p>Uptime: {Math.floor((Date.now() - matchingContainer.createdAt) / 1000)}s</p>
                <p>Image: {matchingContainer.image}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="browser__error">
            <div className="browser__error-icon">❌</div>
            <h2>Bağlantı Reddedildi</h2>
            <p>{url} adresine ulaşılamıyor.</p>
            <div className="browser__error-hint">
              <p>Olası çözümler:</p>
              <ul>
                <li>Terminalde <code>docker build .</code> çalıştırın</li>
                <li>Ardından <code>docker run -p {port}:{port} app</code> çalıştırın</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
