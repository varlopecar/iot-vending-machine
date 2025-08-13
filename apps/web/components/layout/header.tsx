"use client";

import { Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-light-background dark:bg-dark-background border-b border-light-border dark:border-dark-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="ml-auto lg:ml-0">
          <h1 className="text-xl font-semibold">Back-office</h1>
          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
            Gestion des machines de distribution
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* User menu */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
