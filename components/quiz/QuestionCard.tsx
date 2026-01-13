import React from 'react';
import { Likert } from './Likert';
import { QuizItem } from '../../lib/ipip';
import { Card } from '../ui/Card';

type QuestionCardProps = {
  item: QuizItem;
  value?: number;
  onChange: (value: number) => void;
};

export function QuestionCard({ item, value, onChange }: QuestionCardProps) {
  return (
    <Card
      as="article"
      className="question-card gap-4 border-slate-200/80 bg-white/90 p-5 shadow-sm"
      aria-labelledby={`${item.id}-label`}
    >
      <div className="flex items-start gap-3">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">{item.id}</span>
        <p id={`${item.id}-label`} className="text-sm font-semibold text-slate-800">
          {item.prompt}
        </p>
      </div>
      <Likert name={item.id} value={value} onChange={onChange} ariaLabelledby={`${item.id}-label`} />
    </Card>
  );
}
