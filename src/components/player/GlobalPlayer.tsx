"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, Pause, Play } from "lucide-react";

// 動きの強度モード
export type MotionMode = "calm" | "lively";

// 再生中のトラック情報
interface TrackInfo {
  trackId: string;
  name: string;
  imageUrl?: string;
}

interface PlayerState {
  currentTrack: TrackInfo | null;
  isPlaying: boolean;
  motionMode: MotionMode;
}

interface PlayerContextType {
  state: PlayerState;
  play: (track: TrackInfo) => void;
  pause: () => void;
  stop: () => void;
  setMotionMode: (mode: MotionMode) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    motionMode: "calm",
  });

  const play = useCallback((track: TrackInfo) => {
    setState((prev) => ({
      ...prev,
      currentTrack: track,
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
      currentTrack: null,
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
      <FixedPlayer />
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

// 固定フッタープレーヤー
function FixedPlayer() {
  const { state, pause, play, stop } = usePlayer();
  const { currentTrack, isPlaying } = state;

  if (!currentTrack) return null;

  const embedUrl = `https://suno.com/embed/${currentTrack.trackId}?autoplay=1`;

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play(currentTrack);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
        {/* サムネイル */}
        {currentTrack.imageUrl && (
          <img
            src={currentTrack.imageUrl}
            alt={currentTrack.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        )}

        {/* 曲名 */}
        <div className="flex-shrink-0 min-w-0">
          <p className="text-white font-medium truncate max-w-[150px]">
            {currentTrack.name}
          </p>
        </div>

        {/* Sunoプレーヤー（iframe） */}
        <div className="flex-1 max-w-xl">
          {isPlaying && (
            <iframe
              src={embedUrl}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media"
              loading="lazy"
              className="rounded-lg"
            />
          )}
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={stop}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          title="閉じる"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
