'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { PaginationControls } from '../../../components/quiz/PaginationControls';
import { Progress } from '../../../components/quiz/Progress';
import { QuestionCard } from '../../../components/quiz/QuestionCard';
import { QuizEventName, trackQuizEvent } from '../../../lib/analytics';
import { loadQuizItems, QuizItem } from '../../../lib/ipip';
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

  const milestonesRef = useRef<Set<string>>(new Set());
  const startTrackedRef = useRef(false);

  const sanitizedAnswers = useMemo(() => filterAnswers(answers, itemIds), [answers, itemIds]);

  const answeredCount = useMemo(
    () => items.reduce((count, item) => (sanitizedAnswers[item.id] !== undefined ? count + 1 : count), 0),
    [items, sanitizedAnswers]
  );

  useEffect(() => {
    trackQuizEvent('quiz_view');
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
    saveQuizState({ answers: sanitizedAnswers, currentPage, itemCount: items.length });
  }, [currentPage, items.length, sanitizedAnswers]);

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
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: sanitizedAnswers })
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

  return (
    <div className="quiz">
      <header className="quiz__header">
        <p className="eyebrow">IPIP-120</p>
        <h1>Personality questionnaire</h1>
        <p className="muted">
          Rate how much you agree with each statement. Your answers autosave locally so you can pick up where you left off.
        </p>
      </header>

      <Progress answered={answeredCount} total={items.length} currentPage={currentPage} totalPages={totalPages} />

      <div className="question-grid" aria-live="polite">
        {pageItems.map((item) => (
          <QuestionCard
            key={item.id}
            item={item}
            value={sanitizedAnswers[item.id]}
            onChange={(value) => updateAnswer(item.id, value)}
          />
        ))}
      </div>

      <PaginationControls
        canGoBack={currentPage > 0}
        canGoForward={currentPage < totalPages - 1}
        onPrevious={goToPrevPage}
        onNext={goToNextPage}
      />

      <div className="quiz__footer">
        <button className="button" type="button" onClick={handleSubmit} disabled={answeredCount !== items.length || isSubmitting}>
          {isSubmitting ? 'Scoring...' : 'Submit answers'}
        </button>
        <p className="muted">Submit your answers to generate your free results.</p>
        {submitError ? <p className="quiz__error">{submitError}</p> : null}
      </div>
    </div>
  );
}
