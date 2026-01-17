import React from 'react';
import { render } from '@testing-library/react';
import { LikertScale } from '../src/components/figma/quiz/LikertScale';

describe('LikertScale', () => {
  it('updates checked state when value changes', () => {
    const { rerender } = render(
      <LikertScale name="likert" value={2} onChange={() => undefined} questionId="q1" />
    );

    const disagreeRadios = screen.getAllByRole('radio', { name: 'Disagree' });
    const agreeRadios = screen.getAllByRole('radio', { name: 'Agree' });

    disagreeRadios.forEach((radio) => expect(radio).toBeChecked());
    agreeRadios.forEach((radio) => expect(radio).not.toBeChecked());

    rerender(<LikertScale name="likert" value={4} onChange={() => undefined} questionId="q1" />);

    disagreeRadios.forEach((radio) => expect(radio).not.toBeChecked());
    agreeRadios.forEach((radio) => expect(radio).toBeChecked());
  });
});
