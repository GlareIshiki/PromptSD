"use client";

import { useState, useRef } from "react";
import { Upload, Music, X, Image as ImageIcon, Crop } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadImageBlob } from "@/lib/supabase/storage";
import { ImageCropper } from "@/components/upload/ImageCropper";
import { useRouter } from "next/navigation";

const AI_TOOLS = [
  "Midjourney",
  "niji・journey",
  "Stable Diffusion",
  "NovelAI",
  "DALL-E",
  "その他",
];

const PRESET_TAGS: Record<string, { type: "feature" | "emotion" | "world"; tags: string[] }> = {
  feature: { type: "feature", tags: ["猫耳", "犬耳", "うさ耳", "角", "翼", "尻尾", "メガネ", "帽子"] },
  emotion: { type: "emotion", tags: ["笑顔", "泣き顔", "怒り", "驚き", "無表情", "照れ"] },
  world: { type: "world", tags: ["ファンタジー", "現代", "SF", "和風", "スチームパンク", "メルヘン"] },
};

// タグ名からタイプを取得
function getTagType(tagName: string): "feature" | "emotion" | "world" {
  for (const category of Object.values(PRESET_TAGS)) {
    if (category.tags.includes(tagName)) {
      return category.type;
    }
  }
  return "feature"; // デフォルト
}

export default function UploadPage() {
  const [name, setName] = useState("");
  const [shortWorldview, setShortWorldview] = useState("");
  const [aiTool, setAiTool] = useState("");
  const [promptSummary, setPromptSummary] = useState("");
  const [sunoUrl, setSunoUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 画像関連
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImageSrc(e.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob: Blob) => {
    setCroppedBlob(blob);
    setCroppedPreview(URL.createObjectURL(blob));
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setOriginalImageSrc(null);
  };

  const handleEditCrop = () => {
    if (originalImageSrc) {
      setShowCropper(true);
    }
  };

  const handleRemoveImage = () => {
    setOriginalImageSrc(null);
    setCroppedBlob(null);
    setCroppedPreview(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 認証確認
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 画像アップロード
      if (!croppedBlob) {
        throw new Error("画像を選択してください");
      }

      const imageUrl = await uploadImageBlob(croppedBlob, user.id);
      if (!imageUrl) {
        throw new Error("画像のアップロードに失敗しました");
      }

      // キャラクター登録
      const { data: character, error: charError } = await supabase
        .from("characters")
        .insert({
          user_id: user.id,
          name,
          short_worldview: shortWorldview,
          ai_tool_used: aiTool,
          has_music: !!sunoUrl,
          status: "pending",
        })
        .select()
        .single();

      if (charError) throw charError;

      // アセット登録
      const { error: assetError } = await supabase
        .from("assets")
        .insert({
          character_id: character.id,
          type: "image",
          original_url: imageUrl,
          prompt_summary: promptSummary,
        });

      if (assetError) throw assetError;

      // 音楽登録（あれば）
      if (sunoUrl) {
        const { error: musicError } = await supabase
          .from("music")
          .insert({
            character_id: character.id,
            platform: "suno",
            embed_url: sunoUrl,
          });

        if (musicError) throw musicError;
      }

      // タグ登録
      if (selectedTags.length > 0) {
        // まず既存タグを取得、なければ作成
        for (const tagName of selectedTags) {
          const tagType = getTagType(tagName);

          // タグを取得または作成
          let tagId: string;
          const { data: existingTag } = await supabase
            .from("tags")
            .select("id")
            .eq("name", tagName)
            .single();

          if (existingTag) {
            tagId = existingTag.id;
          } else {
            const { data: newTag, error: tagError } = await supabase
              .from("tags")
              .insert({ name: tagName, type: tagType })
              .select("id")
              .single();

            if (tagError) {
              console.error("Tag creation error:", tagError);
              continue;
            }
            tagId = newTag.id;
          }

          // character_tagsに紐付け
          await supabase
            .from("character_tags")
            .insert({
              character_id: character.id,
              tag_id: tagId,
              auto_generated: false,
            });
        }
      }

      // 成功
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        キャラクター投稿
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 画像アップロード */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            画像 *
          </label>
          <div
            onClick={() => !croppedPreview && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center transition-colors ${!croppedPreview ? 'cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600' : ''}`}
          >
            {croppedPreview ? (
              <div className="relative inline-block">
                <img
                  src={croppedPreview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCrop();
                    }}
                    className="p-1.5 bg-zinc-900/80 rounded-full text-white hover:bg-zinc-900 transition-colors"
                    title="再調整"
                  >
                    <Crop size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="p-1.5 bg-zinc-900/80 rounded-full text-white hover:bg-zinc-900 transition-colors"
                    title="削除"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500">
                <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p>クリックして画像を選択</p>
                <p className="text-sm mt-1">PNG, JPG, GIF, WebP</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* キャラ名 */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            キャラクター名 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 星空の魔法使い"
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 outline-none"
            required
          />
        </div>

        {/* 世界観 */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            世界観（40〜80字）
          </label>
          <textarea
            value={shortWorldview}
            onChange={(e) => setShortWorldview(e.target.value)}
            placeholder="このキャラの世界観を短く説明"
            rows={2}
            maxLength={80}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 outline-none resize-none"
          />
          <p className="text-xs text-zinc-500 mt-1">{shortWorldview.length}/80</p>
        </div>

        {/* AIツール */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            使用AIツール *
          </label>
          <select
            value={aiTool}
            onChange={(e) => setAiTool(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 outline-none"
            required
          >
            <option value="">選択してください</option>
            {AI_TOOLS.map((tool) => (
              <option key={tool} value={tool}>
                {tool}
              </option>
            ))}
          </select>
        </div>

        {/* プロンプト要約 */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            プロンプト要約
          </label>
          <textarea
            value={promptSummary}
            onChange={(e) => setPromptSummary(e.target.value)}
            placeholder="生成に使用したプロンプトの要約（著作権物の固有名詞は除く）"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 outline-none resize-none"
          />
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            タグ
          </label>
          <div className="space-y-3">
            {Object.entries(PRESET_TAGS).map(([category, { tags }]) => (
              <div key={category}>
                <p className="text-xs text-zinc-500 mb-1">
                  {category === "feature" ? "外見" : category === "emotion" ? "感情" : "世界観"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suno URL */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            <Music size={16} className="inline mr-1" />
            Suno曲URL（推奨）
          </label>
          <input
            type="url"
            value={sunoUrl}
            onChange={(e) => setSunoUrl(e.target.value)}
            placeholder="https://suno.com/song/..."
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 outline-none"
          />
          <p className="text-xs text-zinc-500 mt-1">
            本人アカウントの曲のみ使用可能です
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* 送信 */}
        <button
          type="submit"
          disabled={loading || !croppedBlob || !name || !aiTool}
          className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          {loading ? "投稿中..." : "投稿する"}
        </button>

        <p className="text-xs text-zinc-500 text-center">
          投稿は承認制です。ガイドラインに沿った内容のみ公開されます。
        </p>
      </form>

      {/* Image Cropper Modal */}
      {showCropper && originalImageSrc && (
        <ImageCropper
          imageSrc={originalImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
