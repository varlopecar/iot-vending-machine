import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", asChild = false, ...props },
    ref
  ) => {
    const baseClasses = cn(
      // Base styles
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      // Variant styles
      {
        "bg-light-secondary dark:bg-dark-secondary text-light-buttonText dark:text-dark-buttonText hover:opacity-90 shadow-sm":
          variant === "primary",
        "bg-light-tertiary dark:bg-dark-tertiary text-light-text dark:text-dark-text hover:opacity-80":
          variant === "secondary",
        "border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background hover:bg-light-tertiary dark:hover:bg-dark-tertiary":
          variant === "outline",
        "hover:bg-light-tertiary dark:hover:bg-dark-tertiary":
          variant === "ghost",
        "bg-light-error dark:bg-dark-error text-white hover:opacity-90 shadow-sm":
          variant === "destructive",
      },
      // Size styles
      {
        "h-8 px-3 text-sm": size === "sm",
        "h-10 px-4": size === "md",
        "h-12 px-6 text-lg": size === "lg",
      },
      className
    );

    if (asChild) {
      // Si asChild est true, on retourne seulement les props de style et on laisse l'enfant gérer le rendu
      const child = React.Children.only(props.children as React.ReactElement);

      const childProps = child.props as Record<string, any> || {};
      return React.cloneElement(child, {
        ...childProps,
        className: cn(baseClasses, childProps.className),
        ref,
      } as any);
    }

    return <button className={baseClasses} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button };
