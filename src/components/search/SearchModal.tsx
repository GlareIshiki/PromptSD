"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface SearchResult {
  id: string;
  name: string;
  short_worldview: string | null;
  assets: { original_url: string }[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("characters")
        .select(`
          id,
          name,
          short_worldview,
          assets (original_url)
        `)
        .eq("status", "public")
        .ilike("name", `%${query}%`)
        .limit(10);

      if (!error && data) {
        setResults(data);
      }
      setLoading(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-700">
          <Search size={20} className="text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キャラクター名で検索..."
            className="flex-1 bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-zinc-500">検索中...</div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/character/${result.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {result.assets[0]?.original_url ? (
                    <img
                      src={result.assets[0].original_url}
                      alt={result.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {result.name}
                    </p>
                    {result.short_worldview && (
                      <p className="text-sm text-zinc-500 truncate">
                        {result.short_worldview}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center text-zinc-500">
              「{query}」に一致するキャラクターが見つかりません
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500">
              キャラクター名を入力してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
