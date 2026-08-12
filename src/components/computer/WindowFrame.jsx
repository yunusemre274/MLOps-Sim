/**
 * WindowFrame.jsx — Windows XP Pencere Çerçevesi Bileşeni (Aşama 1 & 2 Sağlamlaşdırma)
 *
 * Jenerik XP Luna pencere sarmalayıcısı.
 * Küçült (_), Büyüt (□), Kapat (✕) kontrol butonları, başlık çubuğu sürükleme,
 * boyutlandırma kulpu, z-index odaklanma ve Error Boundary koruması sunar.
 */

import { useState, useRef, useEffect } from 'react';
import WindowErrorBoundary from './WindowErrorBoundary';
import './WindowFrame.css';

export default function WindowFrame({
  windowId,
  id,
  title = 'Pencere',
  icon = '🗔',
  children,
  initialPosition = { x: 80, y: 40 },
  initialSize = { width: 680, height: 450 },
  minWidth = 320,
  minHeight = 200,
  zIndex = 10,
  isFocused = false,
  isMinimized = false,
  isMaximized = false,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onDoubleClickTitle,
}) {
  const targetId = windowId || id;
  const [pos, setPos] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);

  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

  // Sürükleme Başlangıcı
  const handleTitleMouseDown = (e) => {
    if (e.button !== 0) return;
    onFocus?.(targetId);
    if (isMaximized) return;

    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
  };

  // Yeniden Boyutlandırma Başlangıcı
  const handleResizeMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onFocus?.(targetId);
    if (isMaximized) return;

    isResizing.current = true;
    resizeStart.current = {
      w: size.width,
      h: size.height,
      x: e.clientX,
      y: e.clientY,
    };
  };

  // Fare Hareketleri (Sürükleme Sınırları Korunur)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging.current) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        // Başlık çubuğunun ekran üstünden/solundan kaybolmasını engelle
        setPos({
          x: Math.max(-200, dragStart.current.posX + dx),
          y: Math.max(0, dragStart.current.posY + dy),
        });
      } else if (isResizing.current) {
        const dw = e.clientX - resizeStart.current.x;
        const dh = e.clientY - resizeStart.current.y;
        setSize({
          width: Math.max(minWidth, resizeStart.current.w + dw),
          height: Math.max(minHeight, resizeStart.current.h + dh),
        });
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      isResizing.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minWidth, minHeight]);

  if (isMinimized) return null;

  const frameStyle = isMaximized
    ? {
        left: 0,
        top: 0,
        width: '100%',
        height: 'calc(100% - 32px)', // Taskbar yüksekliği düşülür
        zIndex,
      }
    : {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex,
      };

  return (
    <div
      className={`xp-window ${isFocused ? 'xp-window--focused' : 'xp-window--unfocused'} ${
        isMaximized ? 'xp-window--maximized' : ''
      }`}
      style={frameStyle}
      onMouseDown={() => onFocus?.(targetId)}
    >
      {/* XP Başlık Çubuğu */}
      <div
        className="xp-window__titlebar"
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={() => onDoubleClickTitle?.(targetId) || onMaximize?.(targetId)}
      >
        <div className="xp-window__title">
          <span className="xp-window__icon">{icon}</span>
          <span className="xp-window__text">{title}</span>
        </div>
        <div className="xp-window__controls" onMouseDown={(e) => e.stopPropagation()}>
          <button
            className="xp-window__btn xp-window__btn--minimize"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onMinimize?.(targetId);
            }}
            title="Küçült"
          >
            _
          </button>
          <button
            className="xp-window__btn xp-window__btn--maximize"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onMaximize?.(targetId);
            }}
            title={isMaximized ? 'Aşağı Getir' : 'Ekranı Kapla'}
          >
            {isMaximized ? '❐' : '□'}
          </button>
          <button
            className="xp-window__btn xp-window__btn--close"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClose?.(targetId);
            }}
            title="Kapat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Pencere Gövdesi + Error Boundary Sarmalayıcısı */}
      <div className="xp-window__body">
        <WindowErrorBoundary appName={title}>
          {children}
        </WindowErrorBoundary>
      </div>

      {/* Yeniden boyutlandırma kulpu */}
      {!isMaximized && (
        <div className="xp-window__resize-handle" onMouseDown={handleResizeMouseDown} />
      )}
    </div>
  );
}
