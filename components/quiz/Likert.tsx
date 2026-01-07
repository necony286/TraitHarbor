import React from 'react';

type LikertProps = {
  name: string;
  value?: number;
  onChange: (value: number) => void;
  ariaLabelledby: string;
};

const options = [
  { label: 'Strongly disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Neutral', value: 3 },
  { label: 'Agree', value: 4 },
  { label: 'Strongly agree', value: 5 }
];

export function Likert({ name, value, onChange, ariaLabelledby }: LikertProps) {
  return (
    <div className="likert" role="radiogroup" aria-labelledby={ariaLabelledby}>
      {options.map((option) => (
        <label key={option.value} className={`likert__option${value === option.value ? ' likert__option--selected' : ''}`}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            aria-label={option.label}
            onChange={() => onChange(option.value)}
          />
          <span className="likert__value">{option.value}</span>
          <span className="likert__label">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
