"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Card, CardContent } from "../ui";

interface EmptySlotCardProps {
  onAddSlot: () => void;
}

export function EmptySlotCard({ onAddSlot }: EmptySlotCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="group hover:shadow-lg transition-all duration-200 bg-light-primary/20 dark:bg-dark-primary/20 border border-light-primary/30 dark:border-dark-primary/30 hover:border-light-primary/50 dark:hover:border-dark-primary/50 cursor-pointer backdrop-blur-sm"
        onClick={onAddSlot}
        role="button"
        tabIndex={0}
        aria-label="Ajouter un produit"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onAddSlot();
          }
        }}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <div className="w-16 h-16 rounded-full bg-light-secondary/30 dark:bg-dark-secondary/30 flex items-center justify-center mb-4 group-hover:bg-light-secondary/40 dark:group-hover:bg-dark-secondary/40 transition-colors backdrop-blur-sm">
            <Plus className="w-8 h-8 text-light-secondary dark:text-dark-secondary group-hover:text-light-secondary/80 dark:group-hover:text-dark-secondary/80 transition-colors" />
          </div>

          <h3 className="font-medium text-light-secondary dark:text-dark-secondary group-hover:text-light-secondary/90 dark:group-hover:text-dark-secondary/90 transition-colors">
            Ajouter un produit
          </h3>
        </CardContent>
      </Card>
    </motion.div>
  );
}
