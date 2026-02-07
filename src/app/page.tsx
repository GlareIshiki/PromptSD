"use client";

import { useState } from "react";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Music, Image, Calendar } from "lucide-react";
import clsx from "clsx";

type Tab = "music" | "nomusic" | "all";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("music");

  const getFilterMusic = () => {
    if (activeTab === "music") return true;
    if (activeTab === "nomusic") return false;
    return undefined;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          SDキャラギャラリー
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          音楽付きSDキャラのための、ノイズのない鑑賞特化ギャラリー。
          <br />
          小さなキャラたちの世界を、音と一緒に眺めよう。
        </p>
      </section>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <TabButton
            active={activeTab === "music"}
            onClick={() => setActiveTab("music")}
            icon={<Music size={16} />}
            label="音楽あり"
          />
          <TabButton
            active={activeTab === "nomusic"}
            onClick={() => setActiveTab("nomusic")}
            icon={<Image size={16} />}
            label="音楽なし"
          />
          <TabButton
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            icon={<Calendar size={16} />}
            label="すべて"
          />
        </div>
      </div>

      {/* Gallery */}
      <GalleryGrid filterMusic={getFilterMusic()} />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
        active
          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
