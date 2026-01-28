/**
 * Filter Dropdown Component
 * @description Reusable dropdown for filtering
 */

import React from 'react';
import { clsx } from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        'w-full px-3 py-2 border border-gray-300 rounded-lg',
        'bg-white text-gray-900',
        'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'appearance-none cursor-pointer',
        className
      )}
    >
      {placeholder && (
        <option value="" disabled={!options.some(o => o.value === '')}>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default FilterDropdown;
