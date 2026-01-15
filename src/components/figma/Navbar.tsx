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
    <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
            <span className="text-lg font-bold">TH</span>
          </div>
          <span className="text-lg font-semibold text-slate-900">TraitHarbor</span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            How it works
          </a>
          <a href="#what-you-get" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            What you get
          </a>
          <a href="#faq" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            FAQ
          </a>
          <Link href="/quiz" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            Quiz
          </Link>
        </div>

        <div className="hidden md:flex">
          <Link
            href="/quiz"
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
            onClick={onStartQuiz}
          >
            Start quiz
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="rounded-md p-2 text-slate-600 transition-colors hover:text-slate-900 md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-white/50 bg-white/90 px-4 py-4 md:hidden">
          <div className="space-y-3">
            <a href="#how-it-works" className="block text-sm font-medium text-slate-700">
              How it works
            </a>
            <a href="#what-you-get" className="block text-sm font-medium text-slate-700">
              What you get
            </a>
            <a href="#faq" className="block text-sm font-medium text-slate-700">
              FAQ
            </a>
            <Link href="/quiz" className="block text-sm font-medium text-slate-700">
              Quiz
            </Link>
          </div>
          <div className="mt-4">
            <Link
              href="/quiz"
              className="block w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-center text-sm font-semibold text-white"
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
