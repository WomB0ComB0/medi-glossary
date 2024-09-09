'use server';

import DictionarySearch from './_components/dictionary-search';

export default async function Page({ searchParams }: { searchParams: { query?: string } }) {
  const query = searchParams.query || 'diabetes';

  return <DictionarySearch initialSearch={query} />;
}
