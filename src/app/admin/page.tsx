"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PendingCharacter {
  id: string;
  name: string;
  short_worldview: string | null;
  ai_tool_used: string | null;
  has_music: boolean;
  created_at: string;
  assets: { original_url: string; prompt_summary: string | null }[];
  music: { embed_url: string }[];
}

export default function AdminPage() {
  const [characters, setCharacters] = useState<PendingCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("characters")
      .select(`
        id,
        name,
        short_worldview,
        ai_tool_used,
        has_music,
        created_at,
        assets (original_url, prompt_summary),
        music (embed_url)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setCharacters(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    const { error } = await supabase
      .from("characters")
      .update({ status: "public" })
      .eq("id", id);

    if (!error) {
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    }
    setProcessing(null);
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    const { error } = await supabase
      .from("characters")
      .update({ status: "reject" })
      .eq("id", id);

    if (!error) {
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    }
    setProcessing(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        承認待ちキャラクター
      </h1>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">読み込み中...</div>
      ) : characters.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          承認待ちのキャラクターはありません
        </div>
      ) : (
        <div className="space-y-4">
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-700"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-32 h-32 flex-shrink-0">
                  {character.assets[0]?.original_url ? (
                    <img
                      src={character.assets[0].original_url}
                      alt={character.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                    {character.name}
                  </h3>
                  {character.short_worldview && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {character.short_worldview}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-zinc-500">
                    <span>AIツール: {character.ai_tool_used || "不明"}</span>
                    <span>音楽: {character.has_music ? "あり" : "なし"}</span>
                    <span>
                      投稿日: {new Date(character.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  {character.assets[0]?.prompt_summary && (
                    <p className="text-xs text-zinc-500 mt-2 bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
                      プロンプト: {character.assets[0].prompt_summary}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleApprove(character.id)}
                    disabled={processing === character.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Check size={16} />
                    承認
                  </button>
                  <button
                    onClick={() => handleReject(character.id)}
                    disabled={processing === character.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <X size={16} />
                    却下
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
