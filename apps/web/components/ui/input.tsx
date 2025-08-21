"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background px-3 py-2 text-sm text-light-text dark:text-dark-text file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-light-textSecondary dark:placeholder:text-dark-textSecondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-secondary dark:focus-visible:ring-dark-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
