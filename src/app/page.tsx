import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export default function Home() {
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

      {/* Motion Toggle */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700">
          <button className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm">
            🍂 静か
          </button>
          <button className="px-3 py-1 rounded-full text-sm text-zinc-500">
            🎉 賑やか
          </button>
        </div>
      </div>

      {/* Gallery */}
      <GalleryGrid filterMusic={true} />

      {/* Empty State (後で使用) */}
      {/*
      <div className="text-center py-20">
        <p className="text-zinc-500 dark:text-zinc-400">
          まだキャラクターがいません。最初の投稿者になりませんか？
        </p>
      </div>
      */}
    </div>
  );
}
