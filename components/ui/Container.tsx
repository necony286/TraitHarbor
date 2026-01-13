import React from 'react';

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
};

export function Container({ as: Component = 'div', className = '', ...props }: ContainerProps) {
  const classes = `ui-container ${className}`.trim();
  return <Component className={classes} {...props} />;
}
