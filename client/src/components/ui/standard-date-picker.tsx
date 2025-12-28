import * as React from "react";
import { format } from "date-fns";

interface StandardDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  maxDate?: Date;
  minDate?: Date;
  disabled?: boolean;
  className?: string;
}

export function StandardDatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  maxDate,
  minDate,
  disabled = false,
  className = ""
}: StandardDatePickerProps) {
  // Convert Date to YYYY-MM-DD format for input type="date"
  const dateValue = value ? format(value, 'yyyy-MM-dd') : '';

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue) {
      const date = new Date(inputValue);
      onChange(date);
    } else {
      onChange(undefined);
    }
  };

  // Format max and min dates for input attributes
  const maxDateStr = maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined;
  const minDateStr = minDate ? format(minDate, 'yyyy-MM-dd') : undefined;

  return (
    <input
      type="date"
      value={dateValue}
      onChange={handleDateChange}
      placeholder={placeholder}
      disabled={disabled}
      max={maxDateStr}
      min={minDateStr}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
      style={{
        colorScheme: 'light'
      }}
    />
  );
}

