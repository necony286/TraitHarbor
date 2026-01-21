import { describe, expect, it } from 'vitest';

import { TRAIT_DETAILS } from '../components/results/traitData';

describe('traitData', () => {
  it('should have TRAIT_DETAILS matching the snapshot', () => {
    expect(TRAIT_DETAILS).toMatchSnapshot();
  });
});
