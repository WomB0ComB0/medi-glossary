'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { genAI, model } from '@/lib/gemini-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Search, Cpu, Copy, Check, History, Trash2 } from 'lucide-react';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';
import { marked } from 'marked';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

type SearchHistory = {
  query: string;
  response: string;
  timestamp: number;
};

export default function AIEnhancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [geminiResults, setGeminiResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formattedContent, setFormattedContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');

  const stripHtmlTags = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  useEffect(() => {
    if (geminiResults) {
      const formatContent = async () => {
        const formatted = await marked(geminiResults);
        setFormattedContent(formatted);
      };
      formatContent();
    }
  }, [geminiResults]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      if (Array.isArray(parsedHistory)) {
        setSearchHistory(parsedHistory as SearchHistory[]);
      }
    }
  }, []);

  const saveToHistory = useCallback((query: string, response: string) => {
    const newHistory = [{ query, response, timestamp: Date.now() }, ...searchHistory].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  const handleCopy = useCallback(() => {
    const textContent = stripHtmlTags(formattedContent);
    copy(textContent)
      .then(() => {
        setIsCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((error) => {
        toast.error(`Failed to copy! ${error instanceof Error ? error.message : String(error)}`);
      });
  }, [formattedContent, copy]);

  const googleGenerativeAI = useMemo(() => genAI, []);
  const geminiModel = useMemo(
    () =>
      googleGenerativeAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
      }),
    [googleGenerativeAI],
  );

  const fetchGeminiResults = async (query: string) => {
    const result = await geminiModel.generateContent(query);
    const response = await result.response;
    return response.text();
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const geminiResponse = await fetchGeminiResults(searchQuery);
      setGeminiResults(geminiResponse);
      saveToHistory(searchQuery, geminiResponse);
    } catch (error) {
      console.error('Error fetching Gemini results:', error);
      setError('An error occurred while fetching results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    toast.success('Search history cleared');
  };

  const loadHistoryItem = (item: SearchHistory) => {
    setSearchQuery(item.query);
    setGeminiResults(item.response);
    setActiveTab('search');
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold text-primary">
          <Cpu className="w-6 h-6 mr-2" />
          AI-Enhanced Medical Search
        </CardTitle>
        <CardDescription>Enter a medical term or question for AI-powered insights</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4 space-x-2">
          <Input
            type="text"
            placeholder="Enter your medical query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'search' | 'history')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="search">Search Results</TabsTrigger>
            <TabsTrigger value="history">Search History</TabsTrigger>
          </TabsList>
          <TabsContent value="search">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : geminiResults ? (
                <div className="prose dark:prose-invert">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Gemini AI Response:</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={isCopied}
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {isCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
                </div>
              ) : (
                <p className="text-muted-foreground">Enter a query and click search to see AI-generated results.</p>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="history">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {searchHistory.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Searches</h3>
                    <Button variant="destructive" size="sm" onClick={clearHistory}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear History
                    </Button>
                  </div>
                  <ul className="space-y-4">
                    {searchHistory.map((item, index) => (
                      <li key={index} className="pb-2 border-b last:border-b-0">
                        <Button
                          variant="link"
                          className="h-auto p-0 text-left"
                          onClick={() => loadHistoryItem(item)}
                        >
                          <History className="inline w-4 h-4 mr-2" />
                          <span className="font-medium">{item.query}</span>
                        </Button>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-muted-foreground">No search history available.</p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}