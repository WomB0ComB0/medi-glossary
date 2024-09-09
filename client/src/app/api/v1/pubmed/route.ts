import axios from 'axios';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const cache = new Map<string, any>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const PubMedResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  abstract: z.string(),
});

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

    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
    const searchParams = new URLSearchParams({
      db: 'pubmed',
      term: query,
      retmax: '10',
      retmode: 'json',
      sort: 'relevance',
    });

    // Step 1: Search for PMIDs
    const searchResponse = await axios.get(`${baseUrl}esearch.fcgi?${searchParams}`);
    const searchData = searchResponse.data;
    const pmids = searchData.esearchresult?.idlist;

    if (!pmids || pmids.length === 0) {
      return NextResponse.json({ message: 'No results found' }, { status: 404 });
    }

    // Step 2: Fetch summaries for the PMIDs
    const summaryParams = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'json',
    });
    const summaryResponse = await axios.get(`${baseUrl}esummary.fcgi?${summaryParams}`);
    const summaryData = summaryResponse.data;

    if (!summaryData || !summaryData.result || typeof summaryData.result !== 'object') {
      throw new Error('Unexpected API response structure');
    }

    const results = pmids.map((pmid: string) => {
      const article = summaryData.result[pmid];
      return {
        id: pmid,
        title: article.title || 'No title',
        abstract: article.abstract || '',
      };
    });

    const validatedResults = z.array(PubMedResultSchema).parse(results);

    cache.set(query, { data: validatedResults, timestamp: Date.now() });

    return NextResponse.json(validatedResults);
  } catch (error) {
    console.error('Error fetching PubMed articles:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data structure from PubMed' }, { status: 500 });
    }
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data || 'Error fetching data from PubMed' },
        { status: error.response?.status || 500 },
      );
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
};
