"use client";

import { CharacterCard } from "./CharacterCard";

// モックデータ（開発用）
const mockCharacters = [
  {
    id: "1",
    name: "星空の魔法使い",
    imageUrl: "https://placehold.co/400x400/6366f1/ffffff?text=SD+Chara",
    hasMusic: true,
    verifiedOwner: true,
    tags: ["魔法使い", "ファンタジー", "星"],
    shortWorldview: "星の力を操る小さな魔法使い。夜空を見上げるのが日課。",
  },
  {
    id: "2",
    name: "にゃんこメイド",
    imageUrl: "https://placehold.co/400x400/ec4899/ffffff?text=SD+Chara",
    hasMusic: true,
    verifiedOwner: false,
    tags: ["猫耳", "メイド", "現代"],
    shortWorldview: "ご主人様のためならなんでもやるにゃ！",
  },
  {
    id: "3",
    name: "機械仕掛けの少女",
    imageUrl: "https://placehold.co/400x400/14b8a6/ffffff?text=SD+Chara",
    hasMusic: true,
    verifiedOwner: true,
    tags: ["スチームパンク", "ロボット", "歯車"],
    shortWorldview: "心はあるの？ないの？それは秘密です。",
  },
  {
    id: "4",
    name: "森の精霊",
    imageUrl: "https://placehold.co/400x400/22c55e/ffffff?text=SD+Chara",
    hasMusic: false,
    tags: ["精霊", "自然", "緑"],
    shortWorldview: "森を守る小さな精霊。人間が苦手。",
  },
  {
    id: "5",
    name: "炎の剣士",
    imageUrl: "https://placehold.co/400x400/f97316/ffffff?text=SD+Chara",
    hasMusic: true,
    verifiedOwner: false,
    tags: ["剣士", "炎", "戦士"],
    shortWorldview: "燃え上がる剣で悪を斬る！正義の味方！",
  },
  {
    id: "6",
    name: "月夜のうさぎ",
    imageUrl: "https://placehold.co/400x400/8b5cf6/ffffff?text=SD+Chara",
    hasMusic: true,
    verifiedOwner: true,
    tags: ["うさ耳", "月", "和風"],
    shortWorldview: "月の光を浴びると力が湧いてくる。お餅が好き。",
  },
];

interface GalleryGridProps {
  filterMusic?: boolean;
}

export function GalleryGrid({ filterMusic }: GalleryGridProps) {
  const characters = filterMusic !== undefined
    ? mockCharacters.filter((c) => c.hasMusic === filterMusic)
    : mockCharacters;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {characters.map((character) => (
        <CharacterCard key={character.id} {...character} />
      ))}
    </div>
  );
}
