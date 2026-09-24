// ============================================================
// AIDORA — SELECT
// ============================================================

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

interface Option {
  value: string;
  label: string;
  desactive?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
  erreur?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, erreur, className, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full h-11 rounded-lg border bg-white pl-4 pr-10 text-sm appearance-none",
            "text-neutral-900 dark:text-white",
            "transition-all duration-150 outline-none focus:ring-4",
            erreur
              ? "border-danger-500 focus:border-danger-500 focus:ring-danger-50"
              : "border-neutral-200 focus:border-primary-500 focus:ring-primary-100",
            "disabled:bg-neutral-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.desactive}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
        />
      </div>
    );
  }
);

Select.displayName = "Select";