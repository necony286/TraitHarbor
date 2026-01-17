import React from 'react';
import { cn } from '../../src/components/figma/ui/utils';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
};

const baseClassName = 'bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border border-border shadow-sm';

export function Card({ as: Component = 'div', className, ...props }: CardProps) {
  return <Component className={cn(baseClassName, className)} {...props} />;
}
