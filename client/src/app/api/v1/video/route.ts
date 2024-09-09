import { videoSchema } from '@/schema';
import { youtube_v3 } from 'googleapis';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const API_KEY = process.env.YOUTUBE_API_KEY;

if (!API_KEY) {
  throw new Error('YOUTUBE_API_KEY is not defined in environment variables');
}

const youTubeSearch = new youtube_v3.Youtube({
  key: API_KEY,
});

export const searchYouTube = async (query: string) => {
  try {
    const res = await youTubeSearch.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults: 10,
      key: API_KEY,
    });

    const data = res.data;
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'No items found' }, { status: 404 });
    }

    const results = data.items
      .map((item: any) => {
        try {
          return videoSchema.parse({
            videoId: item.id?.videoId,
            publishedAt: item.snippet?.publishedAt,
            channelId: item.snippet?.channelId,
            title: item.snippet?.title,
            description: item.snippet?.description,
            channelTitle: item.snippet?.channelTitle,
            liveBroadcastContent: item.snippet?.liveBroadcastContent,
            high: {
              url: item.snippet?.thumbnails?.high?.url,
              height: item.snippet?.thumbnails?.high?.height,
              width: item.snippet?.thumbnails?.high?.width,
            },
          });
        } catch (parseError) {
          console.error('Error parsing video item:', parseError);
          return null;
        }
      })
      .filter(Boolean);

    if (results.length === 0) {
      return NextResponse.json({ error: 'No valid items found' }, { status: 404 });
    }

    return z.array(videoSchema).parse(results);
  } catch (error) {
    console.error('Error fetching data from YouTube:', error);
    return NextResponse.json({ error: 'Failed to fetch data from YouTube' }, { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const query = url.searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const result = await searchYouTube(query);
    if (result instanceof NextResponse) {
      return result;
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data structure from YouTube API' },
        { status: 500 },
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
};
