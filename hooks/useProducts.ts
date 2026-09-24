import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Product, ProductListResponse, ProductFilters } from "@/types/product";
import { productApi, createCancelToken, isCancel } from "@/lib/api/productApi";
import { useDebounce } from "./useDebounce";

const VALID_LIMITS = [10, 20, 50];
const VALID_SORTS = [
  "price-asc",
  "price-desc",
  "rating-asc",
  "rating-desc",
  "title-asc",
  "title-desc",
];

function parseFilters(params: URLSearchParams): ProductFilters {
  const page = parseInt(params.get("page") || "1", 10);
  const limit = parseInt(params.get("limit") || "20", 10);
  return {
    page: isNaN(page) || page < 1 ? 1 : page,
    limit: VALID_LIMITS.includes(limit) ? limit : 20,
    search: params.get("search") || "",
    category: params.get("category") || "",
    sort: VALID_SORTS.includes(params.get("sort") || "") ? params.get("sort")! : "",
  };
}

// Client-side sort helper
function sortProducts(products: Product[], sort: string): Product[] {
  if (!sort) return products;
  const [field, dir] = sort.split("-") as [string, "asc" | "desc"];
  return [...products].sort((a, b) => {
    let av: number | string = 0;
    let bv: number | string = 0;
    if (field === "price") { av = a.price; bv = b.price; }
    else if (field === "rating") { av = a.rating; bv = b.rating; }
    else if (field === "title") { av = a.title.toLowerCase(); bv = b.title.toLowerCase(); }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

export function useProducts() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = parseFilters(searchParams);
  const debouncedSearch = useDebounce(filters.search, 400);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track the latest request to prevent stale responses overwriting newer ones
  const latestRequestId = useRef(0);

  const updateUrl = useCallback(
    (updates: Partial<ProductFilters>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) params.delete(k);
        else params.set(k, String(v));
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const fetchProducts = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    const cancelSource = createCancelToken();
    setLoading(true);
    setError(null);

    const skip = (filters.page - 1) * filters.limit;

    try {
      let result: ProductListResponse;

      if (debouncedSearch) {
        // Search mode: category filter applied client-side (see README)
        result = await productApi.searchProducts(
          debouncedSearch,
          filters.limit,
          skip,
          cancelSource.token
        );
      } else if (filters.category) {
        result = await productApi.getProductsByCategory(
          filters.category,
          filters.limit,
          skip,
          cancelSource.token
        );
      } else {
        result = await productApi.getProducts(
          filters.limit,
          skip,
          cancelSource.token
        );
      }

      // Discard stale responses
      if (requestId !== latestRequestId.current) return;

      const sorted = sortProducts(result.products, filters.sort);
      setProducts(sorted);
      setTotal(result.total);
    } catch (err) {
      if (isCancel(err)) return;
      if (requestId !== latestRequestId.current) return;
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }

    return () => cancelSource.cancel();
  }, [debouncedSearch, filters.page, filters.limit, filters.category, filters.sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Locally remove a deleted product (session-level state)
  const removeProduct = useCallback((id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setTotal((prev) => prev - 1);
  }, []);

  // Locally update an edited product
  const updateProductInList = useCallback((updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  // Prepend a newly created product
  const addProductToList = useCallback((product: Product) => {
    setProducts((prev) => [product, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  return {
    products,
    total,
    loading,
    error,
    filters,
    updateUrl,
    refetch: fetchProducts,
    removeProduct,
    updateProductInList,
    addProductToList,
  };
}
