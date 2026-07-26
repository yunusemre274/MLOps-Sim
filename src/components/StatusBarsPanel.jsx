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
import { advanceTime, getMinutesPerTick, getTickInterval, getTimePeriod } from '../engine/TimeEngine';
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

  // Tick loop — her saniyede barları ve saati güncelle
  const tickRef = useRef(null);

  useEffect(() => {
    if (isPaused) {
      clearInterval(tickRef.current);
      return;
    }

    tickRef.current = setInterval(() => {
      const state = useGameStore.getState();
      const minutesPerTick = getMinutesPerTick();

      // Barları güncelle
      const newBars = calculateBarDecay(state.bars, minutesPerTick);

      // Zamanı ilerlet
      const { newTime, dayEnded } = advanceTime(state.currentTime, minutesPerTick);

      // Store'u güncelle — doğrudan set ile (performans)
      useGameStore.setState({ bars: newBars, currentTime: newTime });

      // Gün bittiyse
      if (dayEnded) {
        advanceDayAction();
      }
    }, getTickInterval());

    return () => clearInterval(tickRef.current);
  }, [isPaused, advanceDayAction]);

  const timePeriod = getTimePeriod(currentTime);

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

        <div className="status-panel__time" title={`Gün ${dayCount}`}>
          <span className="status-panel__time-icon">{TIME_PERIOD_ICONS[timePeriod]}</span>
          <span className="status-panel__time-value">{currentTime}</span>
          <span className="status-panel__day">Gün {dayCount}</span>
        </div>
      </div>
    </header>
  );
}
