import React from 'react';
import { render, screen } from '@testing-library/react';
import { TokenPreview } from '../components/design-system/TokenPreview';

describe('TokenPreview', () => {
  it('shows design token values', () => {
    render(<TokenPreview />);

    expect(screen.getByText(/Design tokens/i)).toBeInTheDocument();
    expect(screen.getByText('#5B7CFA')).toBeInTheDocument();
    expect(screen.getByText(/Inter · 32px/i)).toBeInTheDocument();
    expect(screen.getByText(/12 cols/i)).toBeInTheDocument();
  });
});
