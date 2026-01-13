import React from 'react';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  as?: React.ElementType;
};

export function Badge({ as: Component = 'span', className = '', ...props }: BadgeProps) {
  const classes = `ui-badge ${className}`.trim();
  return <Component className={classes} {...props} />;
}
