'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { QuestionRow } from '@/components/figma/quiz/QuestionRow';
import { QuizHeader } from '@/components/figma/quiz/QuizHeader';
import { ScaleLegend } from '@/components/figma/quiz/ScaleLegend';
import { StickyNavigation } from '@/components/figma/quiz/StickyNavigation';
import { Container } from '../../../components/ui/Container';
import { QuizEventName, trackQuizEvent } from '../../../lib/analytics';
import { loadQuizItems, QuizItem, QuizVariant } from '../../../lib/ipip';
import { getOrCreateAnonymousUserId } from '../../../lib/anonymous-user';
import { clearQuizState, loadQuizState, saveQuizState } from '../../../lib/storage';

const PAGE_SIZE = 12;

type AnswerMap = Record<string, number>;

const scoreResponseSchema = z.object({
  resultId: z.string().optional(),
  error: z.string().optional(),
  quizVariant: z.enum(['ipip120', 'ipip60']).optional()
});

const filterAnswers = (answers: AnswerMap, itemIds: Set<string>) =>
  Object.fromEntries(Object.entries(answers).filter(([id]) => itemIds.has(id)));

export function QuizExperience({
  quizVariant,
  subtitle,
  quickLabel
}: {
  quizVariant: QuizVariant;
  subtitle: string;
  quickLabel?: string;
}) {
  const items = useMemo<QuizItem[]>(() => loadQuizItems({ variant: quizVariant }), [quizVariant]);
  const itemIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPageValidation, setShowPageValidation] = useState(false);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const router = useRouter();

  const sanitizedAnswers = useMemo(() => filterAnswers(answers, itemIds), [answers, itemIds]);

  const answeredCount = Object.keys(sanitizedAnswers).length;

  const milestonesRef = useRef<Set<string>>(new Set());
  const startTrackedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSaveStateRef = useRef({ answers: sanitizedAnswers, currentPage, itemCount: items.length });

  useEffect(() => {
    trackQuizEvent('quiz_view', { quizVariant });
    getOrCreateAnonymousUserId();
    const saved = loadQuizState(quizVariant, items.length);
    if (saved) {
      setAnswers(filterAnswers(saved.answers, itemIds));
      setCurrentPage(Math.min(saved.currentPage, totalPages - 1));
    }
  }, [itemIds, items.length, quizVariant, totalPages]);

  useEffect(() => {
    if (answeredCount > 0 && !startTrackedRef.current) {
      trackQuizEvent('quiz_start', { quizVariant });
      startTrackedRef.current = true;
    }
  }, [answeredCount, quizVariant]);

  useEffect(() => {
    const thresholds: ReadonlyArray<{ readonly name: QuizEventName; readonly value: number }> = [
      { name: 'quiz_25', value: Math.ceil(items.length * 0.25) },
      { name: 'quiz_50', value: Math.ceil(items.length * 0.5) },
      { name: 'quiz_75', value: Math.ceil(items.length * 0.75) },
      { name: 'quiz_complete', value: items.length }
    ];

    thresholds.forEach((threshold) => {
      if (answeredCount >= threshold.value && !milestonesRef.current.has(threshold.name)) {
        trackQuizEvent(threshold.name, { quizVariant });
        milestonesRef.current.add(threshold.name);
      }
    });
  }, [answeredCount, items.length, quizVariant]);

  useEffect(() => {
    latestSaveStateRef.current = { answers: sanitizedAnswers, currentPage, itemCount: items.length };
  }, [currentPage, items.length, sanitizedAnswers]);

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveQuizState(quizVariant, latestSaveStateRef.current);
      saveTimerRef.current = null;
    }, 400);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [currentPage, items.length, quizVariant, sanitizedAnswers]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      saveQuizState(quizVariant, latestSaveStateRef.current);
    };
  }, [quizVariant]);

  const pageItems = items.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const missingPageItems = useMemo(
    () => pageItems.filter((item) => sanitizedAnswers[item.id] == null),
    [pageItems, sanitizedAnswers]
  );
  const isCurrentPageComplete = missingPageItems.length === 0;

  useEffect(() => {
    if (showPageValidation && isCurrentPageComplete) {
      setSubmitError(null);
      setShowPageValidation(false);
    }
  }, [isCurrentPageComplete, showPageValidation]);

  const updateAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => {
      const nextAnswers = { ...prev, [questionId]: value };
      latestSaveStateRef.current = {
        answers: filterAnswers(nextAnswers, itemIds),
        currentPage,
        itemCount: items.length
      };
      return nextAnswers;
    });
  };

  const goToNextPage = useCallback(() => {
    setSubmitError(null);
    setShowPageValidation(false);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setSubmitError(null);
    setShowPageValidation(false);
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleNext = () => {
    if (isLastPage) {
      handleSubmit();
      return;
    }

    if (!isCurrentPageComplete) {
      setShowPageValidation(true);
      setSubmitError('Please answer all questions on this page to continue.');
      if (missingPageItems.length > 0) {
        document
          .getElementById(`question-${missingPageItems[0].id}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    goToNextPage();
  };

  const handleSubmit = async () => {
    const latestAnswers = filterAnswers(latestSaveStateRef.current.answers, itemIds);
    const latestAnsweredCount = Object.keys(latestAnswers).length;

    if (latestAnsweredCount !== items.length || isSubmitting) {
      if (!isSubmitting) {
        setSubmitError('Please answer all questions before submitting.');
      }
      return;
    }

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
        body: JSON.stringify({ answers: latestAnswers, userId, quizVariant })
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

      clearQuizState(quizVariant);
      if (typeof window !== 'undefined') {
        window.location.assign(`/results/${payload.resultId}`);
        return;
      }
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
      <Container className="py-8 lg:py-12">
        <QuizHeader
          title={quickLabel ?? 'Personality questionnaire'}
          subtitle={subtitle}
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
              hasError={showPageValidation && sanitizedAnswers[item.id] == null}
            />
          ))}
        </main>
      </Container>

      <StickyNavigation
        currentPage={currentPage + 1}
        totalPages={totalPages}
        onPrevious={goToPrevPage}
        onNext={handleNext}
        canGoPrevious={currentPage > 0}
        isLastPage={isLastPage}
        errorMessage={submitError ?? undefined}
        statusMessage={isSubmitting ? 'Calculating your answers...' : undefined}
      />
    </div>
  );
}
