import { createClient } from "./client";
import { cropAndResizeImage } from "@/lib/imageUtils";

export async function uploadImage(file: File, userId: string): Promise<string | null> {
  const supabase = createClient();

  try {
    // 画像を1:1にクロップ＆リサイズ（800x800 WebP）
    const resizedBlob = await cropAndResizeImage(file, 800);

    // ファイル名をユニークに（WebP形式）
    const fileName = `${userId}/${Date.now()}.webp`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, resizedBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/webp',
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (err) {
    console.error('Image processing error:', err);
    return null;
  }
}
