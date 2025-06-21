import React, { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  /** Options as an array (alternative to children) */
  options?: Option[];
  /** Placeholder text */
  placeholder?: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Custom class names */
  className?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Controlled selected value */
  value?: string;
  /** HTML ID */
  id?: string;
  /** HTML name */
  name?: string;
  /** Children (alternative to options prop) */
  children?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  id,
  name,
  children,
  disabled = false,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    onChange(newValue);
  };

  // Determine the current value (controlled or uncontrolled)
  const currentValue = value !== undefined ? value : selectedValue;

  return (
    <select
      id={id}
      name={name}
      disabled={disabled}
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        currentValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={currentValue}
      onChange={handleChange}
    >
      {/* Placeholder option */}
      {placeholder && (
        <option
          value=""
          disabled
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {placeholder}
        </option>
      )}

      {/* Render options from props (if provided) */}
      {options?.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {option.label}
        </option>
      ))}

      {/* Render children (if provided) */}
      {children}
    </select>
  );
};

export default Select;