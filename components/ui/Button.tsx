import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const classes = `ui-button ui-button--${variant} ${className}`.trim();
  return <button className={classes} {...props} />;
}
