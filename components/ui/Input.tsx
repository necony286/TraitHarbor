import * as React from 'react';

import { cn } from './utils';

const inputStyles =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 aria-invalid:border-rose-500 aria-invalid:ring-rose-200';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(function Input(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(inputStyles, className)} {...props} />;
});

Input.displayName = 'Input';

export { Input, inputStyles };
