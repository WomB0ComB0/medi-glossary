import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Book, Search, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="w-full mx-auto mb-8 text-4xl font-bold text-center text-green-800 dark:text-green-400">
        Welcome to MediGlossary
      </h1>
      <p className="max-w-2xl mx-auto mb-12 text-xl text-center text-gray-700 dark:text-gray-300">
        MediGlossary is an instant medical term lookup app that helps users quickly understand
        complex health-related terminology. It provides definitions and answers to medical
        questions, making health information more accessible to everyone.
      </p>

      <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="w-full transition-shadow duration-300 bg-white shadow-lg dark:bg-gray-800 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700 dark:text-green-400">
              <Book className="w-6 h-6 mr-2" />
              Medical Dictionary
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Search for medical terms and their definitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Access a comprehensive medical dictionary with detailed definitions and
              pronunciations.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dictionary" passHref className="w-full">
              <Button className="w-full text-white bg-green-600 hover:bg-green-700">
                Open Dictionary Search
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="w-full transition-shadow duration-300 bg-white shadow-lg dark:bg-gray-800 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
              <Search className="w-6 h-6 mr-2" />
              Enhanced Medical Search
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Explore medical terms using various resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Search across multiple platforms including Google, YouTube, PubMed, and MedlinePlus.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/enhanced-search" passHref className="w-full">
              <Button className="w-full text-white bg-blue-600 hover:bg-blue-700">
                Open Enhanced Search
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="w-full transition-shadow duration-300 bg-white shadow-lg dark:bg-gray-800 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700 dark:text-purple-400">
              <Cpu className="w-6 h-6 mr-2" />
              AI-Enhanced Search
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Get AI-powered insights on medical queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Leverage advanced AI technology to get comprehensive answers to your medical questions and explanations of complex terms.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/ai-enhanced-search" passHref className="w-full">
              <Button className="w-full text-white bg-purple-600 hover:bg-purple-700">
                Try AI-Enhanced Search
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}