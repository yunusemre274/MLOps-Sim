/**
 * StatusBarsPanel.jsx — Üst panel: barlar + para + saat
 *
 * Oyun ekranının üst kısmında sabit duran panel.
 * Tüm barları, para durumunu ve oyun saatini gösterir.
 * TimeEngine tick'lerini burada çalıştırarak barları günceller.
 */

import { useEffect, useRef } from 'react';
import useGameStore from '../store/useGameStore';
import { calculateBarDecay } from '../engine/BarEngine';
import { advanceTime, getMinutesPerTick, getTickInterval, getTimePeriod, getFormattedDate } from '../engine/TimeEngine';
import StatusBar from './StatusBar';
import './StatusBarsPanel.css';

const TIME_PERIOD_ICONS = {
  morning:   '🌅',
  afternoon: '☀️',
  evening:   '🌆',
  night:     '🌙',
};

export default function StatusBarsPanel() {
  const bars = useGameStore((s) => s.bars);
  const balance = useGameStore((s) => s.finance.balance);
  const currentTime = useGameStore((s) => s.currentTime);
  const dayCount = useGameStore((s) => s.dayCount);
  const isPaused = useGameStore((s) => s.isPaused);

  const advanceDayAction = useGameStore((s) => s.advanceDay);

  // Tick loop — delta-time ölçümü ile barları ve saati güncelle
  const tickRef = useRef(null);
  const lastTickRef = useRef(null);

  useEffect(() => {
    if (isPaused) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    lastTickRef.current = Date.now();

    tickRef.current = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - (lastTickRef.current || now);
      lastTickRef.current = now;

      // Gerçek geçen süreye göre oyun dakikasını hesapla (1 sn = 16 oyun dakikası)
      const realSeconds = deltaMs / 1000;
      const gameMinutes = getMinutesPerTick() * realSeconds;

      const state = useGameStore.getState();

      // Barları güncelle
      const newBars = calculateBarDecay(state.bars, gameMinutes);

      // Zamanı ilerlet
      const { newTime, dayEnded } = advanceTime(state.currentTime, gameMinutes);

      // Store'u güncelle
      useGameStore.setState({ bars: newBars, currentTime: newTime });

      // Gün bittiyse
      if (dayEnded) {
        useGameStore.getState().advanceDay();
      }
    }, getTickInterval());

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [isPaused]);

  const timePeriod = getTimePeriod(currentTime);
  const { dateStr } = getFormattedDate(dayCount);

  return (
    <header className="status-panel">
      <div className="status-panel__bars">
        {Object.entries(bars).map(([name, bar]) => (
          <StatusBar
            key={name}
            barName={name}
            current={bar.current}
            max={bar.max}
          />
        ))}
      </div>

      <div className="status-panel__info">
        <div className="status-panel__money" title="Bakiye">
          <span className="status-panel__money-icon">💰</span>
          <span className="status-panel__money-value">₺{Math.floor(balance).toLocaleString('tr-TR')}</span>
        </div>

        <div className="status-panel__time" title={`Oyun Günü: ${dayCount} • ${dateStr}`}>
          <span className="status-panel__time-icon">{TIME_PERIOD_ICONS[timePeriod]}</span>
          <span className="status-panel__time-value">{dateStr} {currentTime}</span>
        </div>
      </div>
    </header>
  );
}
