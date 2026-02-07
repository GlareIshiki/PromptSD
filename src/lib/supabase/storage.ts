import { createClient } from "./client";

/**
 * Blobをアップロード（クロップ済み画像用）
 */
export async function uploadImageBlob(blob: Blob, userId: string): Promise<string | null> {
  const supabase = createClient();

  try {
    const fileName = `${userId}/${Date.now()}.webp`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, {
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
    console.error('Upload error:', err);
    return null;
  }
}
