'use client';

import React from 'react';
import { designTokens } from './tokens';

export function TokenPreview() {
  return (
    <section aria-labelledby="design-tokens-title" className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-indigo-100/40">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="h-14 w-14 rounded-2xl shadow-inner" aria-hidden style={{ backgroundColor: designTokens.colors.brand }} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Design tokens</p>
          <h2 id="design-tokens-title" className="mt-2 text-2xl font-semibold text-slate-900">
            Consistent, calming visual language
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Tokens are sourced from the design system: brand indigo, Inter typography, rounded corners, and a 12-column grid.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3" role="list">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-transparent p-4" role="listitem">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Color</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{designTokens.colors.brand}</p>
          <p className="mt-1 text-sm text-slate-600">Primary accents on actions and focus states.</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-transparent p-4" role="listitem">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Typography</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Inter · {designTokens.typography.headingSize}</p>
          <p className="mt-1 text-sm text-slate-600">Readable at 16px base with semibold headings.</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-transparent p-4" role="listitem">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Layout</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {designTokens.layout.gridColumns} cols · {designTokens.layout.maxWidth}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Rounded radii {designTokens.layout.radiusSm} / {designTokens.layout.radiusLg}.
          </p>
        </div>
      </div>
    </section>
  );
}
