import { createClient } from "./client";

export interface CharacterWithAssets {
  id: string;
  name: string;
  short_worldview: string | null;
  has_music: boolean;
  ai_tool_used: string | null;
  status: string;
  created_at: string;
  user_id: string;
  assets: {
    id: string;
    original_url: string;
    thumb_url: string | null;
    prompt_summary: string | null;
  }[];
  music: {
    id: string;
    platform: string;
    embed_url: string;
    verified_owner: boolean;
    title: string | null;
    suno_track_id: string | null;
  }[];
  character_tags: {
    tags: {
      id: string;
      name: string;
      type: string;
      color: string | null;
    };
  }[];
}

export async function getPublicCharacters(options?: {
  hasMusic?: boolean;
  limit?: number;
  offset?: number;
  includeAll?: boolean; // 新着タブ用：statusに関わらず全件取得
}): Promise<CharacterWithAssets[]> {
  const supabase = createClient();
  const { hasMusic, limit = 50, offset = 0, includeAll = false } = options || {};

  let query = supabase
    .from("characters")
    .select(`
      id,
      name,
      short_worldview,
      has_music,
      ai_tool_used,
      status,
      created_at,
      user_id,
      assets (
        id,
        original_url,
        thumb_url,
        prompt_summary
      ),
      music (
        id,
        platform,
        embed_url,
        verified_owner,
        title,
        suno_track_id
      ),
      character_tags (
        tags (
          id,
          name,
          type,
          color
        )
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // 新着タブ以外は承認済みのみ
  if (!includeAll) {
    query = query.eq("status", "public");
  }

  if (hasMusic !== undefined) {
    query = query.eq("has_music", hasMusic);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching characters:", error);
    return [];
  }

  console.log("Fetched characters:", data);
  console.log("First character assets:", data?.[0]?.assets);
  console.log("First character music:", data?.[0]?.music);

  return data as unknown as CharacterWithAssets[];
}

export async function getCharacterById(id: string): Promise<CharacterWithAssets | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("characters")
    .select(`
      id,
      name,
      short_worldview,
      has_music,
      ai_tool_used,
      status,
      created_at,
      user_id,
      assets (
        id,
        original_url,
        thumb_url,
        prompt_summary
      ),
      music (
        id,
        platform,
        embed_url,
        verified_owner,
        title,
        suno_track_id
      ),
      character_tags (
        tags (
          id,
          name,
          type,
          color
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching character:", error);
    return null;
  }

  return data as unknown as CharacterWithAssets;
}
