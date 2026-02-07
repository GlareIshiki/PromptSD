"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// 動きの強度モード
export type MotionMode = "calm" | "lively";

interface PlayerState {
  currentTrackId: string | null;
  isPlaying: boolean;
  motionMode: MotionMode;
}

interface PlayerContextType {
  state: PlayerState;
  play: (trackId: string) => void;
  pause: () => void;
  stop: () => void;
  setMotionMode: (mode: MotionMode) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentTrackId: null,
    isPlaying: false,
    motionMode: "calm", // デフォルトは静か
  });

  const play = useCallback((trackId: string) => {
    setState((prev) => ({
      ...prev,
      currentTrackId: trackId,
      isPlaying: true,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: false,
    }));
  }, []);

  const stop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentTrackId: null,
      isPlaying: false,
    }));
  }, []);

  const setMotionMode = useCallback((mode: MotionMode) => {
    setState((prev) => ({
      ...prev,
      motionMode: mode,
    }));
  }, []);

  return (
    <PlayerContext.Provider value={{ state, play, pause, stop, setMotionMode }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
