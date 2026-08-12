/**
 * MonitoringTab.jsx — Windows XP Kaynak Kullanımı İzleyicisi (Görev Yöneticisi / Task Manager)
 *
 * Faz 17 / GÖREV GRUBU 5:
 * Aktif sahte Docker container'ları ve açık pencerelere bağlı simüle CPU, RAM, Disk ve Network izleyici.
 */

import { useState, useEffect } from 'react';
import { dockerPs, dockerPsAll } from '../../engine/DockerSimulator';
import './MonitoringTab.css';

export default function MonitoringTab({ windowsCount = 1 }) {
  const [activeTab, setActiveTab] = useState('performance'); // 'performance' | 'processes'
  const [statsHistory, setStatsHistory] = useState(() => Array(15).fill(15));

  const runningContainers = dockerPs();
  const allContainers = dockerPsAll();

  // Simüle yük hesaplaması
  const containerCount = runningContainers.length;
  const cpuLoad = Math.min(98, Math.max(8, 12 + containerCount * 22 + windowsCount * 4 + (Date.now() % 7)));
  const ramUsed = (1.6 + containerCount * 1.5 + windowsCount * 0.3).toFixed(1);
  const ramPercent = Math.min(95, Math.round((ramUsed / 16.0) * 100));

  // Her saniye grafik geçmişini güncelle
  useEffect(() => {
    const timer = setInterval(() => {
      setStatsHistory((prev) => [...prev.slice(1), cpuLoad]);
    }, 1000);
    return () => clearInterval(timer);
  }, [cpuLoad]);

  return (
    <div className="monitoring">
      {/* XP Görev Yöneticisi Sekmeleri */}
      <div className="monitoring__tabs">
        <button
          className={`monitoring__tab ${activeTab === 'performance' ? 'monitoring__tab--active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          📈 Performans
        </button>
        <button
          className={`monitoring__tab ${activeTab === 'processes' ? 'monitoring__tab--active' : ''}`}
          onClick={() => setActiveTab('processes')}
        >
          ⚙️ İşlemler ({containerCount + windowsCount})
        </button>
      </div>

      {activeTab === 'performance' ? (
        <div className="monitoring__body">
          {/* CPU Kullanımı */}
          <div className="monitoring__card">
            <div className="monitoring__card-header">
              <span>CPU Kullanımı</span>
              <span className="monitoring__val">{cpuLoad}%</span>
            </div>
            <div className="monitoring__progress-bar">
              <div
                className="monitoring__progress-fill monitoring__progress-fill--cpu"
                style={{ width: `${cpuLoad}%` }}
              />
            </div>
            {/* Sparkline Görsel Grafiği */}
            <div className="monitoring__chart">
              {statsHistory.map((val, i) => (
                <div
                  key={i}
                  className="monitoring__chart-bar"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </div>

          {/* Bellek (RAM) Kullanımı */}
          <div className="monitoring__card">
            <div className="monitoring__card-header">
              <span>Bellek (RAM) Kullanımı</span>
              <span className="monitoring__val">{ramUsed} GB / 16.0 GB ({ramPercent}%)</span>
            </div>
            <div className="monitoring__progress-bar">
              <div
                className="monitoring__progress-fill monitoring__progress-fill--ram"
                style={{ width: `${ramPercent}%` }}
              />
            </div>
          </div>

          {/* SSD / Disk Kullanımı */}
          <div className="monitoring__card">
            <div className="monitoring__card-header">
              <span>Disk (SSD) Alanı</span>
              <span className="monitoring__val">42.8 GB / 256.0 GB (%17)</span>
            </div>
            <div className="monitoring__progress-bar">
              <div className="monitoring__progress-fill monitoring__progress-fill--disk" style={{ width: '17%' }} />
            </div>
          </div>

          {/* Ağ (Network) Trafiği */}
          <div className="monitoring__card">
            <div className="monitoring__card-header">
              <span>Ağ Trafiği</span>
              <span className="monitoring__val">
                {containerCount > 0 ? `${containerCount * 128} KB/s` : '0.4 KB/s'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* İşlemler (Processes) Listesi */
        <div className="monitoring__processes">
          <table className="monitoring__table">
            <thead>
              <tr>
                <th>İşlem Adı</th>
                <th>Tür</th>
                <th>Durum</th>
                <th>Port</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>explorer.exe</td>
                <td>Sistem Masaüstü</td>
                <td>Çalışıyor</td>
                <td>-</td>
              </tr>
              {allContainers.map((c) => (
                <tr key={c.id}>
                  <td>docker:{c.name}</td>
                  <td>Docker Container ({c.image})</td>
                  <td className={c.status === 'running' ? 'monitoring__status--running' : ''}>{c.status}</td>
                  <td>0.0.0.0:{c.port}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
