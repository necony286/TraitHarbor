import React from 'react';
import { cn } from '../../src/components/figma/ui/utils';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  as?: React.ElementType;
};

export function Badge({ as: Component = 'span', className, ...props }: BadgeProps) {
  return (
    <Component
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-4 py-1 text-xs font-semibold text-slate-700 shadow-sm',
        className
      )}
      {...props}
    />
  );
}
