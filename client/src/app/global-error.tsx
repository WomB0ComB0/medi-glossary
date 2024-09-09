'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import * as Sentry from '@sentry/nextjs';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useIsomorphicLayoutEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            An error occurred
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-lg text-center text-muted-foreground">
            We apologize for the inconvenience. Please try again later.
          </p>
          {error instanceof Error && (
            <div className="p-4 overflow-auto rounded-md bg-muted max-h-40">
              <p className="font-mono text-sm text-muted-foreground">
                {error.message}
                {'\n'}
                {error.stack}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={reset}
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}