'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  fetchGoogleSearchResults,
  fetchMedlinePlusInfo,
  fetchPubMedArticles,
  fetchYouTubeVideos,
} from '@/lib/api';
import { debounce } from '@/utils';
import { AlertCircle, Book, Search, Youtube, FileText, Heart } from 'lucide-react';
import Link from 'next/link';

type PubMedArticle = {
  id: string;
  title: string;
  abstract: string;
};

type MedlinePlusResult = {
  title: string;
  snippet: string;
};

type TabData = {
  google: Awaited<ReturnType<typeof fetchGoogleSearchResults>>;
  youtube: Awaited<ReturnType<typeof fetchYouTubeVideos>>;
  pubmed: PubMedArticle[];
  medlineplus: MedlinePlusResult[];
};

const tabs = ['google', 'youtube', 'pubmed', 'medlineplus'] as const;
type Tab = (typeof tabs)[number];

export default function EnhancedSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('google');
  const queryClient = useQueryClient();

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 1000),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const queries = useQueries({
    queries: tabs.map((tab) => ({
      queryKey: [tab, debouncedSearchTerm],
      queryFn: () => {
        switch (tab) {
          case 'google':
            return fetchGoogleSearchResults(debouncedSearchTerm);
          case 'youtube':
            return fetchYouTubeVideos(debouncedSearchTerm);
          case 'pubmed':
            return fetchPubMedArticles(debouncedSearchTerm);
          case 'medlineplus':
            return fetchMedlinePlusInfo(debouncedSearchTerm);
        }
      },
      enabled: !!debouncedSearchTerm,
    })),
  });

  const currentQuery = queries[tabs.indexOf(activeTab)];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const renderContent = () => {
    if (!currentQuery) return null;
    const { data, isLoading, error } = currentQuery;

    if (isLoading) return <Skeleton className="w-full h-[200px]" />;
    if (error)
      return (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      );
    if (!data || (Array.isArray(data) && data.length === 0))
      return (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>No Results</AlertTitle>
          <AlertDescription>No results found for "{debouncedSearchTerm}".</AlertDescription>
        </Alert>
      );

    switch (activeTab) {
      case 'google':
        return renderGoogleContent(data as TabData['google']);
      case 'youtube':
        return renderYouTubeContent(data as TabData['youtube']);
      case 'pubmed':
        return renderPubMedContent(data as PubMedArticle[]);
      case 'medlineplus':
        return renderMedlinePlusContent(data as MedlinePlusResult[]);
    }
  };

  const renderGoogleContent = (googleData: TabData['google']) => (
    <ul className="space-y-4">
      {googleData.items.map((result, index) => (
        <li key={index} className="pb-4 border-b last:border-b-0">
          <Link
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold sm:text-lg text-primary hover:underline"
          >
            {result.title}
          </Link>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{result.snippet}</p>
        </li>
      ))}
    </ul>
  );

  const renderYouTubeContent = (youtubeData: TabData['youtube']) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {youtubeData.map((video, index) => (
        <div key={index} className="overflow-hidden border rounded-lg">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${video.videoId}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="p-2 sm:p-4">
            <h3 className="mb-1 text-xs font-semibold sm:mb-2 sm:text-sm text-primary">{video.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPubMedContent = (pubmedData: PubMedArticle[]) => (
    <Accordion type="single" collapsible className="w-full">
      {pubmedData.map((article, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger className="text-left">
            <span className="text-sm font-semibold sm:text-base text-primary hover:underline">{article.title}</span>
          </AccordionTrigger>
          <AccordionContent>
            {article.abstract && (
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{article.abstract}</p>
            )}
            <Link
              href={`https://pubmed.ncbi.nlm.nih.gov/${article.id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs sm:text-sm text-primary hover:underline"
            >
              View on PubMed
            </Link>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  const renderMedlinePlusContent = (medlinePlusData: MedlinePlusResult[]) => (
    <Accordion type="single" collapsible className="w-full">
      {medlinePlusData.map((result, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger className="text-left">
            <span className="text-sm font-semibold sm:text-base text-primary">{result.title}</span>
          </AccordionTrigger>
          <AccordionContent>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{result.snippet}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Enhanced Medical Search</CardTitle>
        <CardDescription className="text-sm sm:text-base">Explore medical terms using various resources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col mb-4 space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Input
            type="text"
            placeholder="Enter a medical term..."
            value={searchTerm}
            onChange={handleInputChange}
            className="flex-grow"
          />
          <Button
            onClick={() => debouncedSearch(searchTerm)}
            disabled={queries.some((query) => query.isFetching)}
            className="w-full sm:w-auto"
          >
            <Search className="w-4 h-4 mr-2" />
            {queries.some((query) => query.isFetching) ? 'Searching...' : 'Search'}
          </Button>
        </div>
        <div className="relative">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className="relative z-10">
            <TabsList className="grid w-full grid-cols-4 gap-1 mb-2 bg-background">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="flex items-center justify-center px-1 py-1 text-xs sm:text-sm"
                >
                  {tab === 'google' && <Book className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {tab === 'youtube' && <Youtube className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {tab === 'pubmed' && <FileText className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {tab === 'medlineplus' && <Heart className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span className="hidden ml-1 sm:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  <span className="sm:hidden">{tab.slice(0, 1).toUpperCase()}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={activeTab} className="mt-2">
              <ScrollArea className="h-[300px] sm:h-[400px] w-full rounded-md border p-2 sm:p-4">
                {renderContent()}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}