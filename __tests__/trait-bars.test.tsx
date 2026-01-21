import React from 'react';
import { render, screen } from '@testing-library/react';

import { TraitBars } from '../components/results/TraitBars';
import type { TraitKey, TraitScores } from '../components/results/traitData';

describe('TraitBars', () => {
  it('omits bars for traits without metadata', () => {
    const scores: TraitScores = {
      O: 50,
      C: 40,
      E: 30,
      A: 20,
      N: 10
    };

    const traits = ['O', 'Z' as TraitKey];

    render(<TraitBars scores={scores} traits={traits} />);

    expect(screen.getByText('Openness')).toBeInTheDocument();
    expect(screen.getAllByText(/%/)).toHaveLength(1);
  });
});
