"use client";

import Link from "next/link";
import { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  onDelete: (product: Product) => void;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm" aria-label={`Rating: ${rating}`}>
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
      <span className="ml-1 text-gray-500 text-xs">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function ProductTable({ products, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Category
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Rating
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Stock
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                  />
                  <span className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs">
                    {product.title}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                  {product.category}
                </span>
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                ${product.price.toFixed(2)}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <RatingStars rating={product.rating} />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span
                  className={`text-sm font-medium ${
                    product.stock < 10 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {product.stock}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                  >
                    View
                  </Link>
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(product)}
                    className="px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    aria-label={`Delete ${product.title}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
