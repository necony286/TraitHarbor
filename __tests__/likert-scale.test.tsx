import React from 'react';
import { render } from '@testing-library/react';
import { LikertScale } from '../src/components/figma/quiz/LikertScale';

describe('LikertScale', () => {
  it('updates checked state when value changes', () => {
    const { container, rerender } = render(
      <LikertScale name="likert" value={2} onChange={() => undefined} questionId="q1" />
    );

    const getRadiosByValue = (value: number) =>
      Array.from(container.querySelectorAll(`input[type="radio"][value="${value}"]`));

    const isAnyChecked = (value: number) => getRadiosByValue(value).some((input) => input.checked);

    expect(isAnyChecked(2)).toBe(true);
    expect(isAnyChecked(4)).toBe(false);

    rerender(<LikertScale name="likert" value={4} onChange={() => undefined} questionId="q1" />);

    expect(isAnyChecked(2)).toBe(false);
    expect(isAnyChecked(4)).toBe(true);
  });
});
