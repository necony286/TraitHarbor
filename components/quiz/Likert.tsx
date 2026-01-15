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
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-labelledby={ariaLabelledby}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-all ${
            value === option.value
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
              : 'border-slate-200 bg-white/80 text-slate-600 hover:border-indigo-200'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 appearance-none rounded-full border-2 border-indigo-300 shadow-inner checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
