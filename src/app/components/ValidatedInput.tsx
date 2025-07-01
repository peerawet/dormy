"use client";
import { useState, useEffect } from "react";
import { ValidationResult } from "@/utils/validation";

interface ValidatedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onValidation?: (result: ValidationResult) => void;
  validation?: ValidationResult;
  type?: "text" | "number" | "tel" | "email" | "textarea" | "date" | "password";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  suffix?: string;
  icon?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: string;
}

export default function ValidatedInput({
  label,
  value,
  onChange,
  onValidation,
  validation,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  suffix,
  icon,
  rows = 3,
  min,
  max,
  step,
}: ValidatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const showError = validation && !validation.isValid && hasInteracted;
  const showSuccess =
    validation && validation.isValid && hasInteracted && value.trim() !== "";

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasInteracted(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Base input classes
  const baseInputClasses = `
    w-full px-4 py-3 border rounded-xl font-medium
    transition-all duration-300 ease-in-out
    placeholder-gray-400
    focus:outline-none focus:ring-2
    disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
  `;

  // Dynamic classes based on validation state
  const getInputClasses = () => {
    if (disabled) {
      return `${baseInputClasses} border-gray-200 bg-gray-50`;
    }

    if (showError) {
      return `${baseInputClasses} border-red-300 bg-red-50 text-red-900 
              focus:border-red-500 focus:ring-red-500/20
              hover:border-red-400`;
    }

    if (showSuccess) {
      return `${baseInputClasses} border-green-300 bg-green-50 text-green-900
              focus:border-green-500 focus:ring-green-500/20
              hover:border-green-400`;
    }

    if (isFocused) {
      return `${baseInputClasses} border-blue-500 bg-blue-50 text-blue-900
              ring-2 ring-blue-500/20
              hover:border-blue-600`;
    }

    return `${baseInputClasses} border-gray-300 bg-white text-gray-900
            focus:border-blue-500 focus:ring-blue-500/20
            hover:border-gray-400`;
  };

  const inputProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleChange(e.target.value),
    onBlur: handleBlur,
    onFocus: handleFocus,
    placeholder,
    disabled,
    className: getInputClasses(),
    ...(type === "number" && { min, max, step }),
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-700">
        <span className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      </label>

      {/* Input Container */}
      <div className="relative">
        {type === "textarea" ? (
          <textarea
            {...inputProps}
            rows={rows}
            className={getInputClasses() + " resize-none"}
          />
        ) : (
          <input {...inputProps} type={type} />
        )}

        {/* Suffix */}
        {suffix && (
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
            {suffix}
          </span>
        )}

        {/* Validation Icons */}
        {!suffix && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {showError && (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✕</span>
              </div>
            )}
            {showSuccess && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Message */}
      <div className="min-h-[20px]">
        {showError && (
          <div className="flex items-center gap-2 text-red-600 text-sm animate-slide-down">
            <span className="text-xs">⚠️</span>
            <span>{validation?.message}</span>
          </div>
        )}
        {showSuccess && (
          <div className="flex items-center gap-2 text-green-600 text-sm animate-slide-down">
            <span className="text-xs">✅</span>
            <span>ถูกต้อง</span>
          </div>
        )}
      </div>

      {/* Custom CSS for animation */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
