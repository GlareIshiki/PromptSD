"use client";

import Link from "next/link";
import { Music, Image, Calendar, Upload, Search } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

type Tab = "music" | "nomusic" | "daily";

export function Header() {
  const [activeTab, setActiveTab] = useState<Tab>("music");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            PromptSD
          </span>
        </Link>

        {/* Tabs */}
        <nav className="hidden md:flex items-center gap-1">
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
            active={activeTab === "daily"}
            onClick={() => setActiveTab("daily")}
            icon={<Calendar size={16} />}
            label="今日のSDキャラ"
          />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Search size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">投稿</span>
          </Link>
        </div>
      </div>
    </header>
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
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
        active
          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
