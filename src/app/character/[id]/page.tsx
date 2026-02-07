"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Share2,
  Music,
  Eye,
  EyeOff,
  ExternalLink,
  Play,
  Pause,
} from "lucide-react";
import Link from "next/link";
import { getCharacterById, CharacterWithAssets } from "@/lib/supabase/queries";
import { usePlayer } from "@/components/player/GlobalPlayer";
import clsx from "clsx";

// Suno URLからトラックIDを抽出
function extractSunoTrackId(url: string): string | null {
  // /song/ または /s/ パターンに対応
  const match = url.match(/suno\.(com|ai)\/(song|s)\/([a-zA-Z0-9-]+)/);
  return match ? match[3] : null;
}

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { state, play, stop } = usePlayer();

  const [character, setCharacter] = useState<CharacterWithAssets | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    async function fetchCharacter() {
      setLoading(true);
      const data = await getCharacterById(id);
      setCharacter(data);
      setLoading(false);
    }
    if (id) {
      fetchCharacter();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-8" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8"
        >
          <ArrowLeft size={20} />
          戻る
        </Link>
        <div className="text-center py-20">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            キャラクターが見つかりませんでした
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = character.assets[0]?.original_url;
  const promptSummary = character.assets[0]?.prompt_summary;
  const sunoUrl = character.music[0]?.embed_url;
  const trackId = sunoUrl ? extractSunoTrackId(sunoUrl) : null;
  const embedUrl = trackId ? `https://suno.com/embed/${trackId}` : null;
  const isCurrentlyPlaying = trackId && state.currentTrackId === trackId && state.isPlaying;

  const handlePlayClick = () => {
    if (!trackId) return;
    if (isCurrentlyPlaying) {
      stop();
    } else {
      play(trackId);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${character.name || "character"}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: character.name,
          text: character.short_worldview || `${character.name} - PromptSD`,
          url: shareUrl,
        });
      } catch {
        // キャンセル
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("URLをコピーしました");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8"
      >
        <ArrowLeft size={20} />
        戻る
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Image */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                No Image
              </div>
            )}

            {/* Music Badge */}
            {character.has_music && character.music[0]?.verified_owner && (
              <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-amber-500/90 text-white text-sm rounded-full">
                <Music size={14} />
                <span>本人曲</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Download size={18} />
              ダウンロード
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Share2 size={18} />
              シェア
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {character.name}
          </h1>

          {/* World View */}
          {character.short_worldview && (
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {character.short_worldview}
            </p>
          )}

          {/* Tags */}
          {character.character_tags && character.character_tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {character.character_tags.map((ct) => (
                <span
                  key={ct.tags.id}
                  className={clsx(
                    "px-3 py-1 text-sm rounded-full",
                    ct.tags.type === "feature" && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                    ct.tags.type === "emotion" && "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
                    ct.tags.type === "world" && "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  )}
                >
                  {ct.tags.name}
                </span>
              ))}
            </div>
          )}

          {/* Meta Info */}
          <div className="mt-6 flex flex-wrap gap-3">
            {character.ai_tool_used && (
              <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm rounded-full">
                {character.ai_tool_used}
              </span>
            )}
            <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm rounded-full">
              {new Date(character.created_at).toLocaleDateString("ja-JP")}
            </span>
          </div>

          {/* Music Player */}
          {character.has_music && embedUrl && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                Music
              </h2>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
                <button
                  onClick={handlePlayClick}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 transition-colors",
                    isCurrentlyPlaying
                      ? "bg-amber-500 text-white"
                      : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  {isCurrentlyPlaying ? <Pause size={20} /> : <Play size={20} />}
                  <span className="font-medium">
                    {isCurrentlyPlaying ? "再生中" : "再生する"}
                  </span>
                  {character.music[0]?.title && (
                    <span className="text-sm opacity-75 ml-2">
                      {character.music[0].title}
                    </span>
                  )}
                </button>

                {isCurrentlyPlaying && (
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="150"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media"
                    loading="lazy"
                  />
                )}

                {sunoUrl && (
                  <a
                    href={sunoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-t border-zinc-200 dark:border-zinc-700"
                  >
                    <ExternalLink size={14} />
                    Sunoで開く
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Prompt Summary */}
          {promptSummary && (
            <div className="mt-6">
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                {showPrompt ? <EyeOff size={16} /> : <Eye size={16} />}
                プロンプト {showPrompt ? "を隠す" : "を表示"}
              </button>
              {showPrompt && (
                <div className="mt-3 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                    {promptSummary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
