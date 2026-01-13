import React from 'react';
import { Button as FigmaButton } from '../../src/components/figma/ui/button';
import type { buttonVariants } from '../../src/components/figma/ui/button';
import type { VariantProps } from 'class-variance-authority';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: VariantProps<typeof buttonVariants>['size'];
};

const variantMap: Record<ButtonVariant, VariantProps<typeof buttonVariants>['variant']> = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost'
};

export function Button({ variant = 'primary', size, className, ...props }: ButtonProps) {
  return <FigmaButton variant={variantMap[variant]} size={size} className={className} {...props} />;
}
