import { createClient } from '@/utils/supabase/client';
import { type NextRequest, NextResponse } from 'next/server';

import { SearchRecommendationSchema } from '@/schema';
import { customsearch_v1 } from 'googleapis';

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

const customSearch = new customsearch_v1.Customsearch({
  key: API_KEY,
});

const cache = new Map<string, any>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

function truncateQuery(query: string, maxLength = 100): string {
  if (query.length <= maxLength) return query;
  return query.substring(0, maxLength - 3) + '...';
}

export const search = async (query: string) => {
  try {
    const truncatedQuery = truncateQuery(query);

    if (cache.has(truncatedQuery)) {
      const cachedData = cache.get(truncatedQuery);
      if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.data;
      }
    }

    const res = await customSearch.cse.list({
      key: API_KEY,
      cx: SEARCH_ENGINE_ID,
      q: truncatedQuery,
    });
    const data = res.data;
    const result = SearchRecommendationSchema.parse({
      info: data.searchInformation,
      items: data.items?.map((d) => ({
        link: d.link,
        title: d.title,
        snippet: d.snippet || 'No snippet available',
        thumbnail:
          d.pagemap && d.pagemap.cse_thumbnail && d.pagemap.cse_thumbnail.length > 0
            ? {
                src: d.pagemap.cse_thumbnail[0].src,
                width: d.pagemap.cse_thumbnail[0].width,
                height: d.pagemap.cse_thumbnail[0].height,
              }
            : undefined,
      })),
    });

    cache.set(truncatedQuery, { data: result, timestamp: Date.now() });

    return result;
  } catch (error) {
    throw new Error('Error when search : ' + (error as Error).message);
  }
};

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const query = url.searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const searchResults = await search(query);
    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Error in search:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
};
