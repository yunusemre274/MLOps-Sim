/**
 * useVFS.js — Merkezi Reaktif Sanal Dosya Sistemi Hook'u (Faz 13/17 / Round 3)
 *
 * KURAL: Tüm bileşenler (Desktop, Terminal, FileExplorer, Editor) VFS'e
 * YALNIZCA bu hook üzerinden veya globalVFS üzerinden erişir.
 * Hiçbir bileşen kendi lokal dosya listesi state'ini tutmaz!
 */

import { useState, useEffect } from 'react';
import { globalVFS } from '../engine/VirtualFileSystem';

export function useVFS() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    // VFS mutasyonlarında reaktif yeniden render alma
    const unsubscribe = globalVFS.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  return globalVFS;
}

export default useVFS;
