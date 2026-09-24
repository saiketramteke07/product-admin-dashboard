"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProductFilters from "@/components/products/ProductFilters";
import ProductTable from "@/components/products/ProductTable";
import ProductCard from "@/components/products/ProductCard";
import Pagination from "@/components/products/Pagination";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { TableSkeleton, CardsSkeleton } from "@/components/products/ProductSkeleton";
import { useProducts } from "@/hooks/useProducts";
import { productApi } from "@/lib/api/productApi";
import { Product } from "@/types/product";

function ProductsContent() {
  const {
    products,
    total,
    loading,
    error,
    filters,
    updateUrl,
    refetch,
    removeProduct,
  } = useProducts();

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await productApi.deleteProduct(deleteTarget.id);
      removeProduct(deleteTarget.id);
      setDeleteTarget(null);

      // If current page is now empty and not page 1, go back one page
      const remaining = products.length - 1;
      if (remaining === 0 && filters.page > 1) {
        updateUrl({ page: filters.page - 1 });
      }
    } catch {
      // Error is shown via the modal staying open; user can retry
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchChange = (search: string) => {
    updateUrl({ search, page: 1, category: search ? "" : filters.category });
  };

  const handleCategoryChange = (category: string) => {
    updateUrl({ category, page: 1 });
  };

  const handleSortChange = (sort: string) => {
    updateUrl({ sort, page: 1 });
  };

  const handlePageChange = (page: number) => updateUrl({ page });
  const handleLimitChange = (limit: number) => updateUrl({ limit, page: 1 });

  return (
    <DashboardLayout title="Products">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Loading..." : `${total} products total`}
            </p>
          </div>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span aria-hidden="true">+</span> Add Product
          </Link>
        </div>

        {/* Filters */}
        <ProductFilters
          search={filters.search}
          category={filters.category}
          sort={filters.sort}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
        />

        {/* Content */}
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : loading ? (
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:block">
              <TableSkeleton />
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden">
              <CardsSkeleton />
            </div>
          </>
        ) : products.length === 0 ? (
          <EmptyState
            title={filters.search ? "No products match your search." : "No products found."}
            description={
              filters.search
                ? `Try a different search term.`
                : filters.category
                ? "No products in this category."
                : undefined
            }
            action={
              (filters.search || filters.category) ? (
                <button
                  onClick={() => updateUrl({ search: "", category: "", page: 1 })}
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  Clear filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <ProductTable products={products} onDelete={setDeleteTarget} />
            </div>
            {/* Mobile cards */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onDelete={setDeleteTarget} />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !error && total > 0 && (
          <Pagination
            page={filters.page}
            limit={filters.limit}
            total={total}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </DashboardLayout>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <Suspense>
        <ProductsContent />
      </Suspense>
    </AuthGuard>
  );
}
