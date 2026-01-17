'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onStartQuiz?: () => void;
}

export function Navbar({ onStartQuiz }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/25">
            <span className="text-lg font-semibold">TH</span>
          </div>
          <span className="text-lg font-medium text-foreground">TraitHarbor</span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="#what-you-get"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            What you get
          </a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </a>
          <Link href="/quiz" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Quiz
          </Link>
        </div>

        <div className="hidden md:flex">
          <Link
            href="/quiz"
            className="rounded-xl bg-[#2563eb] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#2563eb]/25 transition-all duration-200 hover:bg-[#1d4ed8] hover:shadow-xl hover:shadow-[#2563eb]/30 active:scale-[0.98]"
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
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-border/70 bg-background/95 px-4 py-4 md:hidden">
          <div className="space-y-3">
            <a href="#how-it-works" className="block text-sm font-medium text-foreground">
              How it works
            </a>
            <a href="#what-you-get" className="block text-sm font-medium text-foreground">
              What you get
            </a>
            <a href="#faq" className="block text-sm font-medium text-foreground">
              FAQ
            </a>
            <Link href="/quiz" className="block text-sm font-medium text-foreground">
              Quiz
            </Link>
          </div>
          <div className="mt-4">
            <Link
              href="/quiz"
              className="block w-full rounded-xl bg-[#2563eb] px-5 py-2 text-center text-sm font-medium text-white shadow-lg shadow-[#2563eb]/25"
              onClick={onStartQuiz}
            >
              Start quiz
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
