import { SearchRecommendationSchema, videoSchema } from '@/schema/api';
import { z } from 'zod';

export async function fetchGoogleSearchResults(query: string) {
  try {
    const response = await fetch(`/api/v1/search?query=${query}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return SearchRecommendationSchema.parse(data);
  } catch (error) {
    console.error('Error fetching Google search results:', error);
    throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchYouTubeVideos(query: string) {
  try {
    const response = await fetch(`/api/v1/video?query=${query}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return z.array(videoSchema).parse(data);
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

const PubMedArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  abstract: z.string(),
});

export async function fetchPubMedArticles(query: string) {
  try {
    const response = await fetch(`/api/v1/pubmed?query=${query}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return z.array(PubMedArticleSchema).parse(data);
  } catch (error) {
    console.error('Error fetching PubMed articles:', error);
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
    }
    throw new Error(
      `Failed to fetch PubMed articles: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

const MedlineResultSchema = z.object({
  title: z.string(),
  snippet: z.string(),
});

export async function fetchMedlinePlusInfo(query: string) {
  try {
    const response = await fetch(`/api/v1/medline?query=${query}`);
    if (!response.ok) {
      console.error(`MedlinePlus API responded with status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data)
    return z.array(MedlineResultSchema).parse(data);
  } catch (error) {
    console.error('Error fetching MedlinePlus info:', error);
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
    }
    throw new Error(
      `Failed to fetch MedlinePlus info: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
