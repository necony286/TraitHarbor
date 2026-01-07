import React from 'react';
import { Likert } from './Likert';
import { QuizItem } from '../../lib/ipip';

type QuestionCardProps = {
  item: QuizItem;
  value?: number;
  onChange: (value: number) => void;
};

export function QuestionCard({ item, value, onChange }: QuestionCardProps) {
  return (
    <article className="question-card" aria-labelledby={`${item.id}-label`}>
      <div className="question-card__header">
        <p className="eyebrow">{item.id}</p>
        <p id={`${item.id}-label`} className="question-card__prompt">
          {item.prompt}
        </p>
      </div>
      <Likert name={item.id} value={value} onChange={onChange} />
    </article>
  );
}
