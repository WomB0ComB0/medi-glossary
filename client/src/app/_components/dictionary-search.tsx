'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { CardContent, CardHeader } from '@/components/ui/card';
import { getSearchResults } from '@/lib/fetch';
import type { SearchQueryResultType } from '@/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { Search } from '.';
import { Badge } from '@/components/ui/badge';

type DefinitionResult = SearchQueryResultType[number];

export default function DictionarySearch({
  initialSearch = 'diabetes',
}: {
  initialSearch?: string;
}) {
  const [query] = useQueryState('query');
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading } = useQuery<SearchQueryResultType[], Error>({
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

  const handleSearch = (searchTerm: string) => {
    searchMutation.mutate(searchTerm);
  };

  const renderDefinition = (result: DefinitionResult) => {
    if (typeof result === 'string') {
      return <p>{result}</p>;
    }

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{result.hwi?.hw || 'No title'}</CardTitle>
          <CardDescription>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={result.fl === 'noun' ? 'default' : 'secondary'}>
                {result.fl || 'Unknown'}
              </Badge>
              <Badge variant="outline">
                ID: {result.meta?.id || 'Unknown'}
              </Badge>
              {result.meta?.offensive && (
                <Badge variant="destructive">
                  Offensive
                </Badge>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {result.def?.[0]?.sseq.map((senseSeq, seqIndex) => (
              <AccordionItem key={seqIndex} value={`item-${seqIndex}`}>
                <AccordionTrigger>
                  Sense {senseSeq[0]?.[1]?.sn || seqIndex + 1}
                </AccordionTrigger>
                <AccordionContent>
                  {senseSeq[0]?.[1]?.dt?.map((defText, dtIndex) => (
                    <p key={dtIndex} className="mb-2">
                      {defText[1]}
                    </p>
                  ))}
                  {senseSeq[0]?.[1]?.sdsense && (
                    <div className="mt-2">
                      <strong>Subdefinition:</strong> {senseSeq[0][1].sdsense.sd}
                      {senseSeq[0][1].sdsense.dt?.map((subDefText, subDtIndex) => (
                        <p key={subDtIndex} className="mt-1">
                          {subDefText[1]}
                        </p>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {result.hwi?.prs && result.hwi.prs.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 font-semibold">Pronunciation:</h4>
              {result.hwi.prs.map((prs, prsIndex) => (
                <div key={prsIndex} className="flex items-center space-x-2">
                  <span>{prs.mw}</span>
                  {prs.sound && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const audio = new Audio(
                          `https://media.merriam-webster.com/audio/prons/en/us/mp3/${prs.sound.audio[0]}/${prs.sound.audio}.mp3`,
                        );
                        audio.play();
                      }}
                    >
                      Play
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container p-4 mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dictionary Search</CardTitle>
          <CardDescription>Search for medical terms and their definitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Search search="Enter a medical term..." />
            <Button
              onClick={() => handleSearch(query || initialSearch)}
              disabled={isLoading || searchMutation.isPending}
            >
              {isLoading || searchMutation.isPending ? (
                'Searching...'
              ) : (
                <SearchIcon className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      {searchResults && searchResults.map((result, index) => (
        <div key={index}>{renderDefinition(result as any)}</div>
      ))}
    </div>
  );
}