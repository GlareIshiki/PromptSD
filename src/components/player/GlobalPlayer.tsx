"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, Play } from "lucide-react";

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
  const { state, stop, play } = usePlayer();
  const { currentTrack, isPlaying } = state;

  if (!currentTrack) return null;

  const embedUrl = `https://suno.com/embed/${currentTrack.trackId}?autoplay=1`;

  const handlePlayPause = () => {
    if (isPlaying) {
      // 一時停止はstopで実装（iframeを消す）
    } else {
      play(currentTrack);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center h-24">
        {/* サムネイル */}
        {currentTrack.imageUrl && (
          <img
            src={currentTrack.imageUrl}
            alt={currentTrack.name}
            className="w-24 h-24 object-cover flex-shrink-0"
          />
        )}

        {/* Sunoプレーヤー（iframe）- 再生中のみ表示 */}
        <div className="flex-1 h-24">
          {isPlaying ? (
            <iframe
              src={embedUrl}
              width="100%"
              height="96"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media"
              loading="lazy"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <button
                onClick={() => play(currentTrack)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
              >
                <Play size={20} />
                <span className="font-medium">{currentTrack.name}</span>
              </button>
            </div>
          )}
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={stop}
          className="p-4 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
          title="閉じる"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
}
