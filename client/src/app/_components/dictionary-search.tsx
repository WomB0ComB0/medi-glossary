'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getSearchResults } from '@/lib/fetch';
import type { SearchQueryResultType } from '@/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Book, Search as SearchIcon, Volume2 } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useState } from 'react';

export default function DictionarySearch({
  initialSearch = 'diabetes',
}: {
  initialSearch?: string;
}) {
  const [query, setQuery] = useQueryState('query');
  const [inputValue, setInputValue] = useState(query || initialSearch);
  const queryClient = useQueryClient();

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery<SearchQueryResultType[], Error>({
    queryKey: ['search', query || initialSearch],
    queryFn: async () => {
      const results = await getSearchResults(query || initialSearch);
      return results || [];
    },
    enabled: !!query || !!initialSearch,
  });

  const searchMutation = useMutation<SearchQueryResultType[], Error, string>({
    mutationFn: async (searchTerm) => {
      const results = await getSearchResults(searchTerm);
      return results || [];
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['search', query || initialSearch], data);
    },
  });

  const handleSearch = () => {
    setQuery(inputValue);
    searchMutation.mutate(inputValue);
  };

  const renderDefinition = (result: SearchQueryResultType[number], index: number) => {
    if (typeof result === 'string') {
      return (
        <Alert key={index}>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Suggestion</AlertTitle>
          <AlertDescription>{result}</AlertDescription>
        </Alert>
      );
    }

    return (
      <Card key={index} className="mb-6 bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Book className="w-6 h-6" />
            {result.hwi?.hw || 'No title'}
          </CardTitle>
          <CardDescription>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={result.fl === 'noun' ? 'default' : 'secondary'}>
                {result.fl || 'Unknown'}
              </Badge>
              <Badge variant="outline">ID: {result.meta?.id || 'Unknown'}</Badge>
              {result.meta?.offensive && <Badge variant="destructive">Offensive</Badge>}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="definitions" className="w-full">
            <TabsList className="bg-muted text-muted-foreground">
              <TabsTrigger value="definitions">Definitions</TabsTrigger>
              <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
            </TabsList>
            <TabsContent value="definitions">
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <Accordion type="single" collapsible className="w-full">
                  {result.def?.[0]?.sseq.map((senseSeq, seqIndex) => (
                    <AccordionItem key={seqIndex} value={`item-${seqIndex}`}>
                      <AccordionTrigger className="select-none text-primary">
                        Sense {senseSeq[0]?.[1]?.sn || seqIndex + 1}
                      </AccordionTrigger>
                      <AccordionContent className="text-primary">
                        {senseSeq[0]?.[1]?.dt?.map((defText, dtIndex) => (
                          <p key={dtIndex} className="mb-2">
                            {typeof defText[1] === 'string' ? defText[1] : JSON.stringify(defText[1])}
                          </p>
                        ))}
                        {senseSeq[0]?.[1]?.sdsense && (
                          <div className="mt-2">
                            <strong>Subdefinition:</strong> {senseSeq[0][1].sdsense.sd}
                            {senseSeq[0][1].sdsense.dt?.map((subDefText, subDtIndex) => (
                              <p key={subDtIndex} className="mt-1">
                                {typeof subDefText[1] === 'string' ? subDefText[1] : JSON.stringify(subDefText[1])}
                              </p>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="pronunciation">
              {result.hwi?.prs && result.hwi.prs.length > 0 ? (
                result.hwi.prs.map((prs, prsIndex) => (
                  <div key={prsIndex} className="flex items-center mb-2 space-x-2">
                    <Badge variant="outline" className="text-lg">
                      {prs.mw}
                    </Badge>
                    {prs.sound && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const audio = new Audio(
                                  `https://media.merriam-webster.com/audio/prons/en/us/mp3/${prs.sound.audio[0]}/${prs.sound.audio}.mp3`,
                                );
                                audio.play();
                              }}
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Play pronunciation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-primary">No pronunciation available</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <Separator className="my-4" />
        <CardFooter>
          <p className="text-sm text-muted-foreground">Source: {result.meta?.src || 'Unknown'}</p>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container max-w-4xl p-4 mx-auto">
      <Card className="mb-6 bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Medical Dictionary Search</CardTitle>
          <CardDescription>Search for medical terms and their definitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter a medical term..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-grow text-white bg-input"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || searchMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading || searchMutation.isPending ? (
                'Searching...'
              ) : (
                <>
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            An error occurred while fetching the search results. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="bg-card text-card-foreground">
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        searchResults?.map(renderDefinition as any)
      )}
    </div>
  );
}
