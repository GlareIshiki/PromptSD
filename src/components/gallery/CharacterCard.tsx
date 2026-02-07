"use client";

import { useState } from "react";
import { Play, Pause, Download, Share2, Music } from "lucide-react";
import clsx from "clsx";

interface CharacterCardProps {
  id: string;
  name: string;
  imageUrl: string;
  hasMusic: boolean;
  verifiedOwner?: boolean;
  tags?: string[];
  shortWorldview?: string;
}

export function CharacterCard({
  id,
  name,
  imageUrl,
  hasMusic,
  verifiedOwner = false,
  tags = [],
  shortWorldview,
}: CharacterCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - 正方形 */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Play Button Overlay */}
        {hasMusic && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={clsx(
              "absolute top-3 left-3 p-2 rounded-full transition-all duration-200",
              isPlaying
                ? "bg-zinc-900 text-white"
                : "bg-white/90 text-zinc-900 hover:bg-white"
            )}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        )}

        {/* Verified Owner Badge */}
        {hasMusic && verifiedOwner && (
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
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <Download size={14} className="text-zinc-700" />
          </button>
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <Share2 size={14} className="text-zinc-700" />
          </button>
        </div>
      </div>

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
