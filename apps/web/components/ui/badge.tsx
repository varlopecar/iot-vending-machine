import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border gap-1 py-0.5 px-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        {
          "border-transparent bg-light-secondary dark:bg-dark-secondary text-light-buttonText dark:text-dark-buttonText hover:opacity-80":
            variant === "default",
          "border-transparent bg-light-tertiary dark:bg-dark-tertiary text-light-text dark:text-dark-text hover:opacity-80":
            variant === "secondary",
          "border-transparent bg-red-600 dark:bg-red-800 text-white hover:opacity-80":
            variant === "destructive",
          "text-light-text dark:text-primary border-light-border dark:border-dark-border":
            variant === "outline",
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300":
            variant === "success",
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300":
            variant === "warning",
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300":
            variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
