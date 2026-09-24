"use client";

import Link from "next/link";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onDelete: (product: Product) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={product.thumbnail}
        alt={product.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize mb-2">
          {product.category}
        </span>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
          {product.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">
            ★ {product.rating.toFixed(1)} · {product.stock} in stock
          </span>
        </div>
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            View
          </Link>
          <Link
            href={`/products/${product.id}/edit`}
            className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(product)}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            aria-label={`Delete ${product.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
