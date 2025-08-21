"use client";

import React from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Button, Input } from "@/components/ui";

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export function ProductFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <label htmlFor="product-search" className="sr-only">
          Rechercher un produit
        </label>
        <MagnifyingGlassIcon
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-text dark:text-dark-textSecondary"
          aria-hidden="true"
        />
        <Input
          id="product-search"
          type="text"
          placeholder="Rechercher par nom ou catégorie..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          aria-label="Rechercher un produit par nom ou catégorie"
        />
      </div>

      {/* Filtres par catégorie */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-labelledby="category-filter-label"
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FunnelIcon
            className="h-4 w-4 text-light-text dark:text-dark-textSecondary"
            aria-hidden="true"
          />
          <span
            id="category-filter-label"
            className="text-sm font-medium text-light-text dark:text-dark-textSecondary"
          >
            Catégories :
          </span>
        </div>

        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "primary" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            aria-pressed={selectedCategory === category}
            aria-label={`Filtrer par catégorie ${category}`}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
