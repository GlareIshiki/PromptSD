"use client";

import { useEffect, useState } from "react";
import { CharacterCard } from "./CharacterCard";
import { getPublicCharacters, CharacterWithAssets } from "@/lib/supabase/queries";

interface GalleryGridProps {
  filterMusic?: boolean;
  includeAll?: boolean; // 新着タブ：statusに関わらず全件
}

export function GalleryGrid({ filterMusic, includeAll = false }: GalleryGridProps) {
  const [characters, setCharacters] = useState<CharacterWithAssets[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharacters() {
      setLoading(true);
      const data = await getPublicCharacters({ hasMusic: filterMusic, includeAll });
      setCharacters(data);
      setLoading(false);
    }
    fetchCharacters();
  }, [filterMusic, includeAll]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 dark:text-zinc-400">
          まだキャラクターがいません。最初の投稿者になりませんか？
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          id={character.id}
          name={character.name}
          imageUrl={character.assets[0]?.original_url || ""}
          hasMusic={character.has_music}
          verifiedOwner={character.music[0]?.verified_owner || false}
          shortWorldview={character.short_worldview || undefined}
          sunoUrl={character.music[0]?.embed_url}
          tags={character.character_tags?.map((ct) => ct.tags.name) || []}
          status={character.status}
        />
      ))}
    </div>
  );
}
