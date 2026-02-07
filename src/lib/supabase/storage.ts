import { createClient } from "./client";

/**
 * Blobをアップロード（クロップ済み画像用）
 */
export async function uploadImageBlob(blob: Blob, userId: string): Promise<string | null> {
  const supabase = createClient();

  try {
    const fileName = `${userId}/${Date.now()}.webp`;

    console.log('Uploading file:', fileName, 'size:', blob.size);

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

    console.log('Upload response data:', data);

    // data.path からバケット名を除去（含まれている場合）
    const filePath = data.path.startsWith('images/')
      ? data.path.replace('images/', '')
      : data.path;

    // 公開URLを取得（fileNameを直接使用）
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);

    // URLが正しいか検証（開発用）
    console.log('Expected path in URL:', fileName);

    return publicUrl;
  } catch (err) {
    console.error('Upload error:', err);
    return null;
  }
}
