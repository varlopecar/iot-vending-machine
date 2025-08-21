"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Monitor,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui";

const navigation = [
  {
    name: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Produits",
    href: "/products",
    icon: Package,
  },
  {
    name: "Machines",
    href: "/machines",
    icon: Monitor,
  },
  {
    name: "Statistiques",
    href: "/analytics",
    icon: BarChart3,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm mobile-sidebar-toggle"
        onClick={onToggle}
        aria-label={
          isOpen
            ? "Fermer le menu de navigation"
            : "Ouvrir le menu de navigation"
        }
        aria-expanded={isOpen}
        aria-controls="sidebar-navigation"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </Button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        id="sidebar-navigation"
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : "-100%") : 0,
          width: isMobile ? 256 : isOpen ? 256 : 64,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border shadow-lg h-screen overflow-hidden",
          isMobile ? "mobile-sidebar" : ""
        )}
        aria-label="Navigation principale"
      >
        <div className="flex h-full flex-col min-w-0">
          {/* Logo - Clickable when collapsed on desktop */}
          <div
            className={cn(
              "flex h-16 items-center border-b border-light-border dark:border-dark-border flex-shrink-0",
              isOpen ? "px-6" : "px-0 justify-center"
            )}
          >
            <div
              className={cn(
                "flex items-center",
                isOpen ? "space-x-2" : "",
                !isOpen &&
                !isMobile &&
                "cursor-pointer hover:opacity-80 transition-opacity"
              )}
              onClick={!isOpen && !isMobile ? onToggle : undefined}
              role={!isOpen && !isMobile ? "button" : undefined}
              tabIndex={!isOpen && !isMobile ? 0 : undefined}
              onKeyDown={
                !isOpen && !isMobile
                  ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle();
                    }
                  }
                  : undefined
              }
              aria-label={
                !isOpen && !isMobile
                  ? "Développer le menu de navigation"
                  : undefined
              }
            >
              <div className="h-8 w-8 rounded-lg bg-light-secondary/20 dark:bg-dark-secondary/20 flex items-center justify-center">
                <Monitor
                  className="h-5 w-5 text-light-secondary dark:text-dark-secondary"
                  aria-hidden="true"
                />
              </div>
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-lg font-bold overflow-hidden text-light-text dark:text-dark-text"
                  >
                    VendingAdmin
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden"
            aria-label="Menu de navigation"
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => isMobile && onToggle()}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isOpen ? "justify-start space-x-3" : "justify-center",
                    isActive
                      ? "bg-light-secondary dark:bg-dark-secondary text-light-buttonText dark:text-dark-buttonText shadow-sm"
                      : "text-light-textSecondary dark:text-dark-textSecondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-tertiary dark:hover:bg-dark-tertiary"
                  )}
                  title={!isOpen ? item.name : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && isOpen && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto h-2 w-2 rounded-full bg-light-buttonText dark:bg-dark-buttonText"
                      aria-hidden="true"
                    />
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 text-light-text dark:text-dark-text">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xs text-light-textSecondary dark:text-dark-textSecondary overflow-hidden"
                >
                  VendingAdmin v1.0
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
