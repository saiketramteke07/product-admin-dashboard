"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProductForm from "@/components/products/ProductForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorState from "@/components/ui/ErrorState";
import { productApi } from "@/lib/api/productApi";
import { Product, ProductFormValues } from "@/types/product";

function EditProductContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (isNaN(id) || id <= 0) { setError("Invalid product ID."); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getProduct(id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  const handleSubmit = async (values: ProductFormValues) => {
    const updated = await productApi.updateProduct(id, {
      title: values.title,
      description: values.description,
      price: values.price,
      stock: values.stock,
      category: values.category,
      ...(values.rating ? { rating: values.rating } : {}),
    });
    // Navigate to the product detail page after successful update
    router.push(`/products/${updated.id}`);
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Product">
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !product) {
    return (
      <DashboardLayout title="Error">
        <ErrorState message={error || "Product not found."} onRetry={fetchProduct} />
      </DashboardLayout>
    );
  }

  const initialValues: Partial<ProductFormValues> = {
    title: product.title,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    category: product.category,
    rating: String(product.rating),
  };

  return (
    <DashboardLayout title={`Edit: ${product.title}`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/products" className="text-sm text-gray-500 hover:text-gray-800">
            ← Products
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            href={`/products/${product.id}`}
            className="text-sm text-gray-500 hover:text-gray-800 truncate max-w-xs"
          >
            {product.title}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">Edit</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Edit Product</h1>
          <ProductForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            loadingLabel="Saving..."
          />
        </div>

        <p className="mt-3 text-xs text-gray-400 text-center">
          Note: DummyJSON simulates updates but does not permanently persist changes.
        </p>
      </div>
    </DashboardLayout>
  );
}

export default function EditProductPage() {
  return (
    <AuthGuard>
      <EditProductContent />
    </AuthGuard>
  );
}
