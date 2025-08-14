"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Monitor,
  Boxes,
  ShoppingCart,
  BarChart3,
  Settings,
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
    name: "Stocks",
    href: "/stocks",
    icon: Boxes,
  },
  {
    name: "Commandes",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    name: "Statistiques",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : "-100%") : 0,
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border shadow-lg",
          "lg:static lg:translate-x-0 lg:shadow-none"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-light-secondary/20 dark:bg-dark-secondary/20 flex items-center justify-center">
                <Monitor className="h-5 w-5 text-light-secondary dark:text-dark-secondary" />
              </div>
              <span className="text-lg font-bold">VendingAdmin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-light-secondary dark:bg-dark-secondary text-light-buttonText dark:text-dark-buttonText shadow-sm"
                      : "text-light-textSecondary dark:text-dark-textSecondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-tertiary dark:hover:bg-dark-tertiary"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto h-2 w-2 rounded-full bg-light-buttonText dark:bg-dark-buttonText"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-light-border dark:border-dark-border">
            <div className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
              VendingAdmin v1.0
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
