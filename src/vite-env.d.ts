/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_YOUTUBE_API_KEY: string;
  readonly VITE_VIMEO_CLIENT_ID: string;
  readonly VITE_VIMEO_PERSONAL_ACCESS_TOKEN: string;
  readonly VITE_DAILYMOTION_API_KEY: string;
  readonly VITE_DAILYMOTION_API_SECRET: string;
  readonly VITE_TWITCH_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
