"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProductForm from "@/components/products/ProductForm";
import { productApi } from "@/lib/api/productApi";
import { ProductFormValues } from "@/types/product";

function NewProductContent() {
  const router = useRouter();

  const handleSubmit = async (values: ProductFormValues) => {
    const created = await productApi.createProduct({
      title: values.title,
      description: values.description,
      price: values.price,
      stock: values.stock,
      category: values.category,
      ...(values.rating ? { rating: values.rating } : {}),
    });
    // DummyJSON returns the created product with an id; navigate to it
    router.push(`/products/${created.id}`);
  };

  return (
    <DashboardLayout title="Add Product">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/products"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← Products
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">New Product</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Add New Product</h1>
          <ProductForm
            onSubmit={handleSubmit}
            submitLabel="Create Product"
            loadingLabel="Creating..."
          />
        </div>

        <p className="mt-3 text-xs text-gray-400 text-center">
          Note: DummyJSON simulates creation but does not permanently persist data.
        </p>
      </div>
    </DashboardLayout>
  );
}

export default function NewProductPage() {
  return (
    <AuthGuard>
      <NewProductContent />
    </AuthGuard>
  );
}
