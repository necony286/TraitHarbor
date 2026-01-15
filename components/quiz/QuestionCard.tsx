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
      className="question-card border-slate-200/80 bg-white/90 p-5 shadow-sm"
      aria-labelledby={`${item.id}-label`}
    >
      <p id={`${item.id}-label`} className="question-card__prompt text-sm font-semibold text-slate-800">
        {item.prompt}
      </p>
      <Likert name={item.id} value={value} onChange={onChange} ariaLabelledby={`${item.id}-label`} />
    </Card>
  );
}
