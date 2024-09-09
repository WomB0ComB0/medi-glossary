'use client';

import { CenterLayout, Spotlight } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function NotFound() {
  const router = useRouter();

  return (
    <CenterLayout
      Element="main"
      className="flex flex-col items-center justify-center w-full min-h-screen p-4"
    >
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-bold text-center text-9xl text-primary">404</CardTitle>
        </CardHeader>
        <CardContent>
          <article className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary">Oops! Medical Term Not Found</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              It seems you've searched for a term that's not in our MediGlossary database yet. Don't
              worry, medical knowledge is always expanding, and so are we. Let's get you back to the
              main page where you can look up other medical terms or suggest this one for addition.
            </p>
            <Button
              className="transition-colors duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push('/')}
            >
              Return to MediGlossary
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </article>
        </CardContent>
      </Card>
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <Spotlight
          className="left-0 -top-40 md:left-60 md:-top-20"
          fill="white"
        />
      </div>
    </CenterLayout>
  );
}