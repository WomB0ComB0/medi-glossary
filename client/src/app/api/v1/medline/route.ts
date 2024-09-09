import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const cache = new Map<string, any>();
const CACHE_DURATION = 60 * 60 * 1000;

interface MedlineResult {
  title: string;
  snippet: string;
}

function parseHtml(html: string): string {
  return html
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (cache.has(query)) {
      const cachedData = cache.get(query);
      if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
        return NextResponse.json(cachedData.data);
      }
    }

    const params = new URLSearchParams({
      db: 'healthTopics',
      term: query,
      retmax: '10',
      rettype: 'brief',
      tool: 'medi_glossary',
      email: 'mikeodnis3242004@gmail.com',
    });

    const baseUrl = 'https://wsearch.nlm.nih.gov/ws/query';

    const response = await axios.get(`${baseUrl}?${params}`);

    if (!response.data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    let parsedData;
    if (typeof response.data === 'string') {
      if (response.data.trim().startsWith('<?xml')) {
        const parser = new XMLParser({ ignoreAttributes: false });
        parsedData = parser.parse(response.data);
      } else {
        throw new Error('Received unexpected response format');
      }
    } else {
      parsedData = response.data;
    }
    const results: MedlineResult[] = parsedData.nlmSearchResult.list.document.map((doc: any) => {
      const contentItems = Array.isArray(doc.content) ? doc.content : [doc.content];
      const result: MedlineResult = {
        title: '',
        snippet: '',
      };

      contentItems.forEach((item: any) => {
        const name = item['@_name'];
        const value = item['#text'] || '';

        if (name === 'title') {
          result.title = parseHtml(value);
        } else if (name === 'snippet') {
          result.snippet = parseHtml(value);
        }
      });

      return result;
    });

    cache.set(query, { data: results, timestamp: Date.now() });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in Medline API:', error);
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data || 'Error fetching data from Medline' },
        { status: error.response?.status || 500 },
      );
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
};
