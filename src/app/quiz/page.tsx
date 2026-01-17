'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { QuestionRow } from '@/components/figma/quiz/QuestionRow';
import { QuizHeader } from '@/components/figma/quiz/QuizHeader';
import { ScaleLegend } from '@/components/figma/quiz/ScaleLegend';
import { StickyNavigation } from '@/components/figma/quiz/StickyNavigation';
import { QuizEventName, trackQuizEvent } from '../../../lib/analytics';
import { loadQuizItems, QuizItem } from '../../../lib/ipip';
import { getOrCreateAnonymousUserId } from '../../../lib/anonymous-user';
import { clearQuizState, loadQuizState, saveQuizState } from '../../../lib/storage';

const PAGE_SIZE = 12;

type AnswerMap = Record<string, number>;

const scoreResponseSchema = z.object({
  resultId: z.string().optional(),
  error: z.string().optional()
});

const filterAnswers = (answers: AnswerMap, itemIds: Set<string>) =>
  Object.fromEntries(Object.entries(answers).filter(([id]) => itemIds.has(id)));

export default function QuizPage() {
  const items = useMemo<QuizItem[]>(() => loadQuizItems(), []);
  const itemIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const router = useRouter();

  const sanitizedAnswers = useMemo(() => filterAnswers(answers, itemIds), [answers, itemIds]);

  const answeredCount = Object.keys(sanitizedAnswers).length;

  const milestonesRef = useRef<Set<string>>(new Set());
  const startTrackedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSaveStateRef = useRef({ answers: sanitizedAnswers, currentPage, itemCount: items.length });

  useEffect(() => {
    trackQuizEvent('quiz_view');
    getOrCreateAnonymousUserId();
    const saved = loadQuizState(items.length);
    if (saved) {
      setAnswers(filterAnswers(saved.answers, itemIds));
      setCurrentPage(Math.min(saved.currentPage, totalPages - 1));
    }
  }, [itemIds, items.length, totalPages]);

  useEffect(() => {
    if (answeredCount > 0 && !startTrackedRef.current) {
      trackQuizEvent('quiz_start');
      startTrackedRef.current = true;
    }
  }, [answeredCount]);

  useEffect(() => {
    const thresholds: ReadonlyArray<{ readonly name: QuizEventName; readonly value: number }> = [
      { name: 'quiz_25', value: Math.ceil(items.length * 0.25) },
      { name: 'quiz_50', value: Math.ceil(items.length * 0.5) },
      { name: 'quiz_75', value: Math.ceil(items.length * 0.75) },
      { name: 'quiz_complete', value: items.length }
    ];

    thresholds.forEach((threshold) => {
      if (answeredCount >= threshold.value && !milestonesRef.current.has(threshold.name)) {
        trackQuizEvent(threshold.name);
        milestonesRef.current.add(threshold.name);
      }
    });
  }, [answeredCount, items.length]);

  useEffect(() => {
    latestSaveStateRef.current = { answers: sanitizedAnswers, currentPage, itemCount: items.length };
  }, [currentPage, items.length, sanitizedAnswers]);

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveQuizState(latestSaveStateRef.current);
      saveTimerRef.current = null;
    }, 400);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [currentPage, items.length, sanitizedAnswers]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      saveQuizState(latestSaveStateRef.current);
    };
  }, []);

  const pageItems = items.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const updateAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (answeredCount !== items.length || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const userId = getOrCreateAnonymousUserId();
      if (!userId) {
        setSubmitError('We could not start your quiz session. Please refresh and try again.');
        return;
      }

      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: sanitizedAnswers, userId })
      });

      const parsedPayload = scoreResponseSchema.safeParse(await response.json());

      if (!parsedPayload.success) {
        console.error('Invalid score response payload', parsedPayload.error);
        setSubmitError('We could not score your quiz. Please try again.');
        return;
      }

      const payload = parsedPayload.data;

      if (!response.ok || !payload.resultId) {
        setSubmitError(payload.error ?? 'We could not score your quiz. Please try again.');
        return;
      }

      clearQuizState();
      router.push(`/results/${payload.resultId}`);
    } catch (error) {
      setSubmitError((error as Error).message || 'We could not score your quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastPage = currentPage === totalPages - 1;
  const pageStartIndex = currentPage * PAGE_SIZE;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="container max-w-4xl mx-auto px-4 py-8 lg:py-12">
        <QuizHeader
          title="Personality questionnaire"
          subtitle="IPIP-120"
          currentPage={currentPage + 1}
          totalPages={totalPages}
          answeredCount={answeredCount}
          totalQuestions={items.length}
        />

        <div className="mt-6 lg:mt-8">
          <ScaleLegend />
        </div>

        <main className="mt-6 lg:mt-8 space-y-4" aria-live="polite">
          {pageItems.map((item, index) => (
            <QuestionRow
              key={item.id}
              questionId={item.id}
              questionNumber={pageStartIndex + index + 1}
              questionText={item.prompt}
              value={sanitizedAnswers[item.id] ?? null}
              onChange={(value) => updateAnswer(item.id, value)}
            />
          ))}
        </main>
      </div>

      <StickyNavigation
        currentPage={currentPage + 1}
        totalPages={totalPages}
        onPrevious={goToPrevPage}
        onNext={isLastPage ? handleSubmit : goToNextPage}
        canGoPrevious={currentPage > 0}
        isLastPage={isLastPage}
        errorMessage={submitError ?? (isSubmitting ? 'Scoring your answers...' : undefined)}
      />
    </div>
  );
}
