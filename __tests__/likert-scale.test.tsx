import React from 'react';
import { render, screen } from '@testing-library/react';
import { LikertScale } from '../src/components/figma/quiz/LikertScale';

describe('LikertScale', () => {
  it('updates checked state when value changes', () => {
    const { rerender } = render(
      <LikertScale name="likert" value={2} onChange={() => undefined} questionId="q1" />
    );

    const getDisagreeRadios = () => screen.getAllByRole('radio', { name: 'Disagree' });
    const getAgreeRadios = () => screen.getAllByRole('radio', { name: 'Agree' });

    getDisagreeRadios().forEach((radio) => expect(radio).toBeChecked());
    getAgreeRadios().forEach((radio) => expect(radio).not.toBeChecked());

    rerender(<LikertScale name="likert" value={4} onChange={() => undefined} questionId="q1" />);

    getDisagreeRadios().forEach((radio) => expect(radio).not.toBeChecked());
    getAgreeRadios().forEach((radio) => expect(radio).toBeChecked());
  });
});
