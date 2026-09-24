"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/product";
import { productApi } from "@/lib/api/productApi";

interface ProductFiltersProps {
  search: string;
  category: string;
  sort: string;
  onSearchChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onSortChange: (v: string) => void;
}

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-asc", label: "Rating: Low to High" },
  { value: "rating-desc", label: "Rating: High to Low" },
  { value: "title-asc", label: "Title: A to Z" },
  { value: "title-desc", label: "Title: Z to A" },
];

export default function ProductFilters({
  search,
  category,
  sort,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(false);

  useEffect(() => {
    productApi
      .getCategories()
      .then((data) => setCategories(data))
      .catch(() => setCatError(true))
      .finally(() => setCatLoading(false));
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
          🔍
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Category */}
      <div className="sm:w-48">
        <label htmlFor="category-filter" className="sr-only">
          Filter by category
        </label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={catLoading || catError || !!search}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          title={search ? "Category filter is disabled during search" : undefined}
        >
          {catLoading ? (
            <option>Loading...</option>
          ) : catError ? (
            <option>Error loading</option>
          ) : (
            <>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </>
          )}
        </select>
        {search && (
          <p className="mt-1 text-xs text-amber-600">
            Category filter disabled during search
          </p>
        )}
      </div>

      {/* Sort */}
      <div className="sm:w-52">
        <label htmlFor="sort-filter" className="sr-only">
          Sort products
        </label>
        <select
          id="sort-filter"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
