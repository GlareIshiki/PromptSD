"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface SunoPlayerProps {
  sunoUrl: string;
  title?: string;
  compact?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

// Suno URLからトラックIDを抽出
function extractSunoTrackId(url: string): string | null {
  // https://suno.com/song/xxxxx or https://suno.com/s/xxxxx に対応
  const match = url.match(/suno\.(com|ai)\/(song|s)\/([a-zA-Z0-9-]+)/);
  return match ? match[3] : null;
}

export function SunoPlayer({
  sunoUrl,
  title,
  compact = false,
  onPlay,
  onPause,
}: SunoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const trackId = extractSunoTrackId(sunoUrl);

  if (!trackId) {
    return (
      <div className="text-sm text-zinc-500 p-2">
        無効なSuno URLです
      </div>
    );
  }

  // Suno埋め込みURL
  const embedUrl = `https://suno.com/embed/${trackId}`;

  const handlePlayPause = () => {
    // iframe内の再生制御はpostMessageで行う（Suno APIが対応している場合）
    // 現状はiframe全体の表示/非表示で擬似的に制御
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
    setIsPlaying(!isPlaying);
  };

  if (compact) {
    return (
      <button
        onClick={handlePlayPause}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        <span className="text-sm">{title || "再生"}</span>
      </button>
    );
  }

  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
      {/* プレーヤーヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-80 transition-opacity"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          {title && (
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {title}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          {isMuted ? (
            <VolumeX size={16} className="text-zinc-500" />
          ) : (
            <Volume2 size={16} className="text-zinc-500" />
          )}
        </button>
      </div>

      {/* Suno埋め込み */}
      <div className={`relative ${isPlaying ? "block" : "hidden"}`}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          width="100%"
          height="150"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media"
          loading="lazy"
          className={isMuted ? "opacity-50" : ""}
          onError={() => setError(true)}
        />
      </div>

      {error && (
        <div className="p-4 text-sm text-zinc-500">
          埋め込みの読み込みに失敗しました。
          <a
            href={sunoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1"
          >
            Sunoで開く
          </a>
        </div>
      )}
    </div>
  );
}
