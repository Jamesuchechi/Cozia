-- ========================================================
-- COZIA DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. PROFILES TABLE (Extends Supabase Auth users)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb, -- e.g. {"twitter": "@user", "youtube": "channel"}
  is_kid_mode BOOLEAN DEFAULT false,
  parental_pin_hash TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'curator', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Cozia Member'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------
-- 2. CURATED VIDEOS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.curated_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL CHECK (provider IN ('youtube', 'vimeo', 'dailymotion', 'twitch')),
  provider_video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT NOT NULL,
  duration TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  safety_status TEXT DEFAULT 'pending' CHECK (safety_status IN ('pending', 'approved', 'rejected')),
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  is_live BOOLEAN DEFAULT false,
  UNIQUE(provider, provider_video_id)
);

-- --------------------------------------------------------
-- 3. SHELVES / ROWS TABLE (Browse page row definitions)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shelves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  filter_type TEXT DEFAULT 'category', -- category, provider, tag, trending
  video_ids UUID[] DEFAULT '{}',
  display_order INT DEFAULT 0,
  is_kids_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 4. USER SAVED VIDEOS (My List)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_saved_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  curated_video_id UUID NOT NULL REFERENCES public.curated_videos(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, curated_video_id)
);

-- --------------------------------------------------------
-- 5. FOLLOWS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- --------------------------------------------------------
-- 6. POSTS TABLE (Social Feed)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  curated_video_id UUID REFERENCES public.curated_videos(id) ON DELETE SET NULL,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 7. COMMENTS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  curated_video_id UUID REFERENCES public.curated_videos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 8. REACTIONS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'video')),
  target_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- --------------------------------------------------------
-- 9. MODERATION QUEUE TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitting_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  video_url TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('youtube', 'vimeo', 'dailymotion', 'twitch')),
  safety_status TEXT DEFAULT 'pending' CHECK (safety_status IN ('pending', 'approved', 'rejected')),
  category_suggestion TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Curated Videos Policies
DROP POLICY IF EXISTS "Approved videos are viewable by everyone" ON public.curated_videos;
CREATE POLICY "Approved videos are viewable by everyone"
  ON public.curated_videos FOR SELECT USING (safety_status = 'approved');

DROP POLICY IF EXISTS "Admins/Curators can manage curated videos" ON public.curated_videos;
CREATE POLICY "Admins/Curators can manage curated videos"
  ON public.curated_videos FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'curator'))
  );

DROP POLICY IF EXISTS "Allow insertion into curated_videos" ON public.curated_videos;
CREATE POLICY "Allow insertion into curated_videos"
  ON public.curated_videos FOR INSERT WITH CHECK (true);

-- 3. Shelves Policies
DROP POLICY IF EXISTS "Shelves are viewable by everyone" ON public.shelves;
CREATE POLICY "Shelves are viewable by everyone"
  ON public.shelves FOR SELECT USING (true);

-- 4. User Saved Videos Policies
DROP POLICY IF EXISTS "Users can view their own saved list" ON public.user_saved_videos;
CREATE POLICY "Users can view their own saved list"
  ON public.user_saved_videos FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into their saved list" ON public.user_saved_videos;
CREATE POLICY "Users can insert into their saved list"
  ON public.user_saved_videos FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their saved list" ON public.user_saved_videos;
CREATE POLICY "Users can delete from their saved list"
  ON public.user_saved_videos FOR DELETE USING (auth.uid() = user_id);

-- 5. Follows Policies
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own follows" ON public.follows;
CREATE POLICY "Users can manage their own follows"
  ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- 6. Posts Policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- 7. Comments Policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 8. Reactions Policies
DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.reactions;
CREATE POLICY "Reactions are viewable by everyone"
  ON public.reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage reactions" ON public.reactions;
CREATE POLICY "Authenticated users can manage reactions"
  ON public.reactions FOR ALL USING (auth.uid() = user_id);

-- 9. Moderation Queue Policies
DROP POLICY IF EXISTS "Users can insert nominations into moderation queue" ON public.moderation_queue;
CREATE POLICY "Users can insert nominations into moderation queue"
  ON public.moderation_queue FOR INSERT WITH CHECK (auth.uid() = submitting_user_id);

DROP POLICY IF EXISTS "Admins can view and manage moderation queue" ON public.moderation_queue;
CREATE POLICY "Admins can view and manage moderation queue"
  ON public.moderation_queue FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'curator'))
  );
