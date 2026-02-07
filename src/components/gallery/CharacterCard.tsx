"use client";

import { useState } from "react";
import { Play, Pause, Download, Share2, Music } from "lucide-react";
import clsx from "clsx";
import { usePlayer } from "@/components/player/GlobalPlayer";

interface CharacterCardProps {
  id: string;
  name: string;
  imageUrl: string;
  hasMusic: boolean;
  verifiedOwner?: boolean;
  tags?: string[];
  shortWorldview?: string;
  sunoUrl?: string;
  sunoTrackId?: string | null;
  status?: string;
}

// Suno URLからトラックIDを抽出
function extractSunoTrackId(url: string): string | null {
  // /song/ または /s/ パターンに対応
  const match = url.match(/suno\.(com|ai)\/(song|s)\/([a-zA-Z0-9-]+)/);
  return match ? match[3] : null;
}

export function CharacterCard({
  id,
  name,
  imageUrl,
  hasMusic,
  verifiedOwner = false,
  tags = [],
  shortWorldview,
  sunoUrl,
  sunoTrackId,
  status = "public",
}: CharacterCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { state, play, stop } = usePlayer();

  // sunoTrackId があればそれを使う、なければURLから抽出を試みる
  const trackId = sunoTrackId || (sunoUrl ? extractSunoTrackId(sunoUrl) : null);
  const embedUrl = trackId ? `https://suno.com/embed/${trackId}` : null;

  // このカードが現在再生中かどうか
  const isCurrentlyPlaying = state.currentTrackId === trackId && state.isPlaying;
  const isCalm = state.motionMode === "calm";

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!trackId) return;

    if (isCurrentlyPlaying) {
      // 再生中なら停止
      stop();
    } else {
      // 他のトラックを停止してこのトラックを再生
      play(trackId);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name || "character"}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/character/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: shortWorldview || `${name} - PromptSD`,
          url: shareUrl,
        });
      } catch {
        // ユーザーがキャンセルした場合など
      }
    } else {
      // フォールバック: クリップボードにコピー
      await navigator.clipboard.writeText(shareUrl);
      alert("URLをコピーしました");
    }
  };

  return (
    <div
      className={clsx(
        "group relative bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300",
        isCurrentlyPlaying && "ring-2 ring-amber-500 shadow-amber-500/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - 正方形 */}
      <div className="relative aspect-square overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={clsx(
              "w-full h-full object-cover transition-transform",
              isCalm ? "duration-500" : "duration-300",
              !isCalm && "group-hover:scale-105"
            )}
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
            <span className="text-zinc-400">No Image</span>
          </div>
        )}

        {/* Play Button Overlay */}
        {hasMusic && embedUrl && (
          <button
            onClick={handlePlayClick}
            className={clsx(
              "absolute top-3 left-3 p-2 rounded-full transition-all duration-200",
              isCurrentlyPlaying
                ? clsx("bg-amber-500 text-white", !isCalm && "animate-pulse")
                : "bg-white/90 text-zinc-900 hover:bg-white"
            )}
          >
            {isCurrentlyPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        )}

        {/* Status Badge (pending) */}
        {status === "pending" && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-zinc-500/90 text-white text-xs rounded-full">
            未承認
          </div>
        )}

        {/* Verified Owner Badge */}
        {status === "public" && hasMusic && verifiedOwner && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-amber-500/90 text-white text-xs rounded-full">
            <Music size={12} />
            <span>本人曲</span>
          </div>
        )}

        {/* Action Buttons - Hover時に表示 */}
        <div
          className={clsx(
            "absolute bottom-3 right-3 flex gap-2 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            onClick={handleDownload}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            title="ダウンロード"
          >
            <Download size={14} className="text-zinc-700" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            title="シェア"
          >
            <Share2 size={14} className="text-zinc-700" />
          </button>
        </div>
      </div>

      {/* Suno Player - 再生中のみ表示 */}
      {isCurrentlyPlaying && embedUrl && (
        <div className="border-t border-zinc-200 dark:border-zinc-700">
          <iframe
            src={embedUrl}
            width="100%"
            height="100"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media"
            loading="lazy"
          />
        </div>
      )}

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {name}
        </h3>
        {shortWorldview && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
            {shortWorldview}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
