'use server';
import DictionarySearch from '@/app/_components/dictionary-search';
import React from 'react';

export default async function DictionaryPage({
  searchParams,
}: { searchParams: { query?: string } }) {
  const query = searchParams.query || 'diabetes';
  return <DictionarySearch initialSearch={query} />;
}
