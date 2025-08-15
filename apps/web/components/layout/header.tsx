"use client";

import { Moon, Sun, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/auth-context";

interface HeaderProps {
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onSidebarToggle, isSidebarOpen }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="bg-light-background dark:bg-dark-background border-b border-light-border dark:border-dark-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Sidebar toggle button - only show when sidebar is open on desktop */}
          {isSidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="h-9 w-9 p-0 lg:flex hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          <div>
            <h1 className="text-xl font-semibold">Back-office</h1>
            <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
              Gestion des machines de distribution
            </p>
          </div>
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

          {/* User info */}
          {user && (
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium">{user.full_name}</div>
                <div className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  {user.role}
                </div>
              </div>
            </div>
          )}

          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
