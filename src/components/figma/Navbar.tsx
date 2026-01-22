'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Container } from '../../../components/ui/Container';

interface NavbarProps {
  onStartQuiz?: () => void;
}

export function Navbar({ onStartQuiz }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="TraitHarbor home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <span className="text-lg font-semibold">TH</span>
          </div>
          <span className="text-lg font-medium text-foreground">TraitHarbor</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
          <Link
            href="/#what-you-get"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            What you get
          </Link>
          <Link href="/#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link
            href="/my-reports"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            My reports
          </Link>
          <Link href="/quiz" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Quiz
          </Link>
        </div>

        <div className="hidden md:flex">
          <Link
            href="/quiz"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onStartQuiz}
          >
            Start quiz
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {isMenuOpen ? (
        <div id="mobile-menu" className="border-t border-border/70 bg-background/95 md:hidden">
          <Container className="py-4">
            <div className="space-y-3">
              <Link href="/#how-it-works" className="block text-sm font-medium text-foreground">
                How it works
              </Link>
              <Link href="/#what-you-get" className="block text-sm font-medium text-foreground">
                What you get
              </Link>
              <Link href="/#faq" className="block text-sm font-medium text-foreground">
                FAQ
              </Link>
              <Link href="/my-reports" className="block text-sm font-medium text-foreground">
                My reports
              </Link>
              <Link href="/quiz" className="block text-sm font-medium text-foreground">
                Quiz
              </Link>
            </div>
            <div className="mt-4">
              <Link
                href="/quiz"
                className="block w-full rounded-xl bg-primary px-5 py-2 text-center text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={onStartQuiz}
              >
                Start quiz
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </nav>
  );
}
