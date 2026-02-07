-- PromptSD Initial Schema
-- SDキャラギャラリー用データベース設計

-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  suno_account_id TEXT,
  links JSONB DEFAULT '[]',
  policy_flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ステータス列挙型
CREATE TYPE character_status AS ENUM ('draft', 'pending', 'public', 'hold', 'reject');

-- キャラクターテーブル
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_worldview TEXT, -- 40-80字の世界観要約
  description TEXT, -- マークダウン対応の詳細説明
  has_music BOOLEAN DEFAULT FALSE,
  ai_tool_used TEXT, -- 使用したAIツール名
  sd_score FLOAT DEFAULT 0, -- 等身スコア（0-1）
  status character_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- アセットタイプ列挙型
CREATE TYPE asset_type AS ENUM ('image', 'gif', 'mp4', 'webm');

-- アセットテーブル（1キャラ=1アセットが原則）
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  original_url TEXT NOT NULL,
  thumb_url TEXT,
  preview_url TEXT,
  width INT,
  height INT,
  file_size INT,
  prompt_summary TEXT, -- プロンプト要約（著作権物は除去済み）
  downloadable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 音楽プラットフォーム列挙型
CREATE TYPE music_platform AS ENUM ('suno', 'youtube', 'soundcloud', 'custom');

-- 音楽テーブル
CREATE TABLE music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  platform music_platform NOT NULL,
  suno_track_id TEXT,
  embed_url TEXT NOT NULL,
  verified_owner BOOLEAN DEFAULT FALSE, -- 本人曲かどうか
  account_id TEXT, -- 外部サービスのアカウントID
  title TEXT,
  duration INT, -- 秒数
  volume_normalized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- タグタイプ列挙型
CREATE TYPE tag_type AS ENUM ('feature', 'emotion', 'world');

-- タグテーブル
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type tag_type NOT NULL,
  color TEXT, -- 表示色（hex）
  synonyms TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- キャラクター-タグ中間テーブル
CREATE TABLE character_tags (
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  confidence FLOAT DEFAULT 1.0, -- AI判定の信頼度
  auto_generated BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (character_id, tag_id)
);

-- モデレーションログ
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'approve', 'reject', 'hold', 'delete', 'warn', 'ban'
  reason TEXT,
  moderator_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- エンゲージメント（将来用）
CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'view', 'like', 'download', 'share', 'listen_complete'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_status ON characters(status);
CREATE INDEX idx_characters_has_music ON characters(has_music);
CREATE INDEX idx_characters_created_at ON characters(created_at DESC);
CREATE INDEX idx_assets_character_id ON assets(character_id);
CREATE INDEX idx_music_character_id ON music(character_id);
CREATE INDEX idx_character_tags_character_id ON character_tags(character_id);
CREATE INDEX idx_character_tags_tag_id ON character_tags(tag_id);
CREATE INDEX idx_engagements_character_id ON engagements(character_id);

-- RLS（Row Level Security）ポリシー
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_tags ENABLE ROW LEVEL SECURITY;

-- 公開キャラは誰でも閲覧可能
CREATE POLICY "Public characters are viewable by everyone"
  ON characters FOR SELECT
  USING (status = 'public');

-- 自分のキャラは全ステータス閲覧可能
CREATE POLICY "Users can view own characters"
  ON characters FOR SELECT
  USING (auth.uid() = user_id);

-- 自分のキャラのみ編集可能
CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  USING (auth.uid() = user_id);

-- 自分のキャラのみ削除可能
CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  USING (auth.uid() = user_id);

-- 認証ユーザーは投稿可能
CREATE POLICY "Authenticated users can insert characters"
  ON characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
