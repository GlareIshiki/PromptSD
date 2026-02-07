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
  }[];
}

export async function getPublicCharacters(options?: {
  hasMusic?: boolean;
  limit?: number;
  offset?: number;
}): Promise<CharacterWithAssets[]> {
  const supabase = createClient();
  const { hasMusic, limit = 50, offset = 0 } = options || {};

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
        title
      )
    `)
    .eq("status", "public")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (hasMusic !== undefined) {
    query = query.eq("has_music", hasMusic);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching characters:", error);
    return [];
  }

  return data as CharacterWithAssets[];
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
        title
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching character:", error);
    return null;
  }

  return data as CharacterWithAssets;
}
