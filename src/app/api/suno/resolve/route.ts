import { NextRequest, NextResponse } from "next/server";

/**
 * Suno短縮URL (/s/) を実際の曲IDに解決するAPI
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // /s/ パターンの短縮URLかチェック
    const shortMatch = url.match(/suno\.com\/s\/([a-zA-Z0-9]+)/);
    if (!shortMatch) {
      // 短縮URLでなければ、/song/ パターンをそのまま返す
      const songMatch = url.match(/suno\.com\/song\/([a-zA-Z0-9-]+)/);
      if (songMatch) {
        return NextResponse.json({ songId: songMatch[1], originalUrl: url });
      }
      return NextResponse.json({ error: "Invalid Suno URL" }, { status: 400 });
    }

    // 短縮URLにアクセスしてリダイレクト先を取得
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    // 最終的なURLから曲IDを抽出
    const finalUrl = response.url;
    const songMatch = finalUrl.match(/suno\.com\/song\/([a-zA-Z0-9-]+)/);

    if (songMatch) {
      return NextResponse.json({
        songId: songMatch[1],
        originalUrl: url,
        resolvedUrl: finalUrl,
      });
    }

    // HTMLからsong IDを抽出する（リダイレクトしない場合）
    const html = await response.text();
    const idMatch = html.match(/"songId":"([a-zA-Z0-9-]+)"/);
    if (idMatch) {
      return NextResponse.json({
        songId: idMatch[1],
        originalUrl: url,
      });
    }

    // パラメータから抽出を試みる
    const paramMatch = html.match(/\/song\/\[slug\].*?"([a-zA-Z0-9-]{36})"/);
    if (paramMatch) {
      return NextResponse.json({
        songId: paramMatch[1],
        originalUrl: url,
      });
    }

    return NextResponse.json({ error: "Could not resolve song ID" }, { status: 400 });
  } catch (error) {
    console.error("Error resolving Suno URL:", error);
    return NextResponse.json({ error: "Failed to resolve URL" }, { status: 500 });
  }
}
