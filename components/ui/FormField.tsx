import * as React from 'react';

import { cn } from './utils';

type FormFieldProps = {
  id: string;
  label: string;
  description?: string;
  error?: string | null;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  children: React.ReactElement;
};

function FormField({
  id,
  label,
  description,
  error,
  className,
  labelClassName,
  descriptionClassName,
  errorClassName,
  children
}: FormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const childDescribedBy = children.props['aria-describedby'] as string | undefined;
  const describedBy = [childDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined;
  const childAriaInvalid = children.props['aria-invalid'];

  const control = React.cloneElement(children, {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': Boolean(error) || childAriaInvalid
  });

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className={cn('text-sm font-medium text-slate-700', labelClassName)}>
        {label}
      </label>
      {control}
      {description ? (
        <p id={descriptionId} className={cn('text-sm text-slate-500', descriptionClassName)}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={cn('text-sm text-rose-600', errorClassName)}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { FormField };
