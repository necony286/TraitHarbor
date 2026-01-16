'use client';

import { useRouter } from 'next/navigation';
import { HomePage } from '@/components/figma/home/HomePage';

export function HomePageClient() {
  const router = useRouter();

  return <HomePage onStartTest={() => router.push('/quiz')} />;
}
