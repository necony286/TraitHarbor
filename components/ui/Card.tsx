import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
};

export function Card({ as: Component = 'div', className = '', ...props }: CardProps) {
  const classes = `ui-card ${className}`.trim();
  return <Component className={classes} {...props} />;
}
