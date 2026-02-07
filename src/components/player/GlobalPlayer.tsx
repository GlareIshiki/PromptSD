"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface PlayerState {
  currentTrackId: string | null;
  isPlaying: boolean;
}

interface PlayerContextType {
  state: PlayerState;
  play: (trackId: string) => void;
  pause: () => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentTrackId: null,
    isPlaying: false,
  });

  const play = useCallback((trackId: string) => {
    setState({
      currentTrackId: trackId,
      isPlaying: true,
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: false,
    }));
  }, []);

  const stop = useCallback(() => {
    setState({
      currentTrackId: null,
      isPlaying: false,
    });
  }, []);

  return (
    <PlayerContext.Provider value={{ state, play, pause, stop }}>
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
