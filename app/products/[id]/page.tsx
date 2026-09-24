"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { productApi } from "@/lib/api/productApi";
import { Product } from "@/types/product";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? "text-amber-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProduct = async () => {
    if (isNaN(id) || id <= 0) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getProduct(id);
      setProduct(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load product.";
      // DummyJSON returns 404 message for invalid IDs
      if (msg.toLowerCase().includes("not found") || msg.includes("404")) {
        setNotFound(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  const handleDelete = async () => {
    if (!product || deleting) return;
    setDeleting(true);
    try {
      await productApi.deleteProduct(product.id);
      router.push("/products");
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Product Details">
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout title="Product Not Found">
        <div className="max-w-lg mx-auto text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
          >
            ← Back to Products
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Error">
        <ErrorState message={error} onRetry={fetchProduct} />
      </DashboardLayout>
    );
  }

  if (!product) return null;

  return (
    <DashboardLayout title={product.title}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb / back */}
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            ← Back to Products
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/products/${product.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={product.images[activeImage] || product.thumbnail}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage ? "border-blue-500" : "border-gray-200"
                    }`}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={i === activeImage}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize mb-2">
                {product.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
              {product.brand && (
                <p className="text-sm text-gray-500 mt-1">by {product.brand}</p>
              )}
            </div>

            <StarRating rating={product.rating} />

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  -{product.discountPercentage.toFixed(0)}% off
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Stock</p>
                <p className={`text-sm font-semibold ${product.stock < 10 ? "text-red-600" : "text-gray-900"}`}>
                  {product.stock} units
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Rating</p>
                <p className="text-sm font-semibold text-gray-900">{product.rating.toFixed(1)} / 5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <section aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="text-lg font-semibold text-gray-900 mb-4">
              Customer Reviews ({product.reviews.length})
            </h2>
            <div className="space-y-3">
              {product.reviews.map((review, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{review.reviewerName}</p>
                      <p className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex text-amber-400 text-sm" aria-label={`${review.rating} stars`}>
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Product"
          message={`Are you sure you want to delete "${product.title}"?`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setShowDeleteModal(false)}
        />
      )}
    </DashboardLayout>
  );
}

export default function ProductDetailPage() {
  return (
    <AuthGuard>
      <ProductDetailContent />
    </AuthGuard>
  );
}
