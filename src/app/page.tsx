'use client';

import { useRouter } from 'next/navigation';
import { HomePage } from '@/components/figma/home/HomePage';

export default function Page() {
  const router = useRouter();

  return <HomePage onStartTest={() => router.push('/quiz')} />;
}
