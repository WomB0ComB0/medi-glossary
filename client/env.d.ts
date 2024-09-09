declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ANALYZE: string;
      NEXT_PHASE: 'phase-production-build' | 'phase-development-build';
      NEXT_PUBLIC_VERCEL_ENV: 'development' | 'production';
      NEXT_PUBLIC_GOOGLE_AI_API_KEY: string;
      GOOGLE_SEARCH_API_KEY: string;
      GOOGLE_SEARCH_ENGINE_ID: string;
      YOUTUBE_API_KEY: string;
      NEXT_PUBLIC_DICTIONARY_API_KEY: string;
      SENTRY_AUTH_TOKEN: string;
    }
  }
}

export type {};
