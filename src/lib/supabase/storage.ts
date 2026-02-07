import { createClient } from "./client";

export async function uploadImage(file: File, userId: string): Promise<string | null> {
  const supabase = createClient();

  // ファイル名をユニークに
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
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
}
