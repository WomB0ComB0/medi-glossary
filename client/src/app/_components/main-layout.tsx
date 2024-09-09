'use client';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/providers';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { name: 'Dictionary', path: '/dictionary' },
    { name: 'Search', path: '/enhanced-search' },
    { name: 'AI Enhanced Search', path: '/ai-enhanced-search' },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 dark:bg-black bg-white dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative">
      <nav className="sticky top-0 z-50 shadow-lg backdrop-blur-md bg-white/30 dark:bg-black/30">
        <div className="container flex items-center justify-between px-4 py-2 mx-auto">
          <Link href="/" className="flex items-center space-x-2 text-lg font-semibold">
            <Image src="/assets/svgs/logo-small.svg" alt="Logo" height={32} width={32} />
            <span className="font-semibold">MediGlossary</span>
          </Link>
          <div className="items-center hidden space-x-6 md:flex">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="text-sm font-medium text-green-700 transition-colors hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
              >
                {item.name}
              </Link>
            ))}
            <ModeToggle />
          </div>
          <div className="flex items-center md:hidden">
            <Button
              onClick={toggleMenu}
              variant="ghost"
              size="icon"
              className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="block px-3 py-2 text-base font-medium text-green-700 rounded-md hover:text-green-900 hover:bg-green-100 dark:text-green-300 dark:hover:text-green-100 dark:hover:bg-green-900"
                  onClick={toggleMenu}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <ModeToggle />
              </div>
            </div>
          </div>
        )}
      </nav>
      <Separator />
      <main className="container relative z-10 px-4 py-8 mx-auto">{children}</main>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>
    </div>
  );
}
