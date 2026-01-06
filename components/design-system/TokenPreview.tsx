'use client';

import React from 'react';
import { designTokens } from './tokens';

export function TokenPreview() {
  return (
    <section aria-labelledby="design-tokens-title" className="token-preview">
      <div className="token-preview__header">
        <div className="token-swatch" aria-hidden style={{ backgroundColor: designTokens.colors.brand }} />
        <div>
          <p className="eyebrow">Design tokens</p>
          <h2 id="design-tokens-title">Consistent, calming visual language</h2>
          <p className="muted">
            Tokens are sourced from the design system: brand indigo, Inter typography, rounded corners, and a 12-column grid.
          </p>
        </div>
      </div>
      <div className="token-grid" role="list">
        <div className="token-card" role="listitem">
          <p className="eyebrow">Color</p>
          <p className="token-value">{designTokens.colors.brand}</p>
          <p className="muted">Primary accents on actions and focus states.</p>
        </div>
        <div className="token-card" role="listitem">
          <p className="eyebrow">Typography</p>
          <p className="token-value">Inter · {designTokens.typography.headingSize}</p>
          <p className="muted">Readable at 16px base with semibold headings.</p>
        </div>
        <div className="token-card" role="listitem">
          <p className="eyebrow">Layout</p>
          <p className="token-value">{designTokens.layout.gridColumns} cols · {designTokens.layout.maxWidth}</p>
          <p className="muted">Rounded radii {designTokens.layout.radiusSm} / {designTokens.layout.radiusLg}.</p>
        </div>
      </div>
    </section>
  );
}
