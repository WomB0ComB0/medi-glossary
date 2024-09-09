import type { SearchQueryResultType } from '@/schema';

export async function getSearchResults(
  searchParams: string,
): Promise<SearchQueryResultType[] | undefined> {
  if (searchParams === '') return undefined;
  try {
    const res = await fetch(
      `https://dictionaryapi.com/api/v3/references/medical/json/${searchParams}?key=${process.env.NEXT_PUBLIC_DICTIONARY_API_KEY}`,
    );
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = (await res.json()) as SearchQueryResultType[];

    return data || undefined;
  } catch (error) {
    console.error('Error fetching data:', error);
    return undefined;
  }
}
