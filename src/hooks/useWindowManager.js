/**
 * useWindowManager.js — Reaktif Pencere Yöneticisi Hook'u (Aşama 2)
 *
 * WindowManager state değişikliklerinde reaktif yeniden render sağlar.
 */

import { useState, useEffect } from 'react';
import { windowManager } from '../engine/WindowManager';

export function useWindowManager() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = windowManager.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  return windowManager;
}

export default useWindowManager;
