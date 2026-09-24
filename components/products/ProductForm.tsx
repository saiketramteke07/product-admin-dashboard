"use client";

import { useState, FormEvent } from "react";
import { ProductFormValues } from "@/types/product";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel?: string;
  loadingLabel?: string;
}

const DEFAULT_VALUES: ProductFormValues = {
  title: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  rating: "",
};

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
}

function validate(values: ProductFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) errors.title = "Title is required.";
  if (!values.description.trim()) errors.description = "Description is required.";
  if (!values.category.trim()) errors.category = "Category is required.";
  const price = parseFloat(values.price);
  if (!values.price || isNaN(price) || price <= 0)
    errors.price = "Price must be a positive number.";
  const stock = parseInt(values.stock, 10);
  if (!values.stock || isNaN(stock) || stock < 0)
    errors.stock = "Stock must be a non-negative integer.";
  return errors;
}

export default function ProductForm({
  initialValues = {},
  onSubmit,
  submitLabel = "Save Product",
  loadingLabel = "Saving...",
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: keyof ProductFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return; // prevent duplicate submissions

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    id: keyof ProductFormValues,
    label: string,
    type: string = "text",
    props: Record<string, unknown> = {}
  ) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={values[id]}
        onChange={set(id)}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[id as keyof FormErrors]
            ? "border-red-400 bg-red-50"
            : "border-gray-300"
        }`}
        aria-describedby={errors[id as keyof FormErrors] ? `${id}-error` : undefined}
        aria-invalid={!!errors[id as keyof FormErrors]}
        {...props}
      />
      {errors[id as keyof FormErrors] && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
          {errors[id as keyof FormErrors]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {apiError && (
        <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {apiError}
        </div>
      )}

      {field("title", "Title *")}
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          value={values.description}
          onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.description ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
          aria-describedby={errors.description ? "description-error" : undefined}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p id="description-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("price", "Price ($) *", "number", { min: "0", step: "0.01" })}
        {field("stock", "Stock *", "number", { min: "0", step: "1" })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("category", "Category *")}
        {field("rating", "Rating (0–5)", "number", { min: "0", max: "5", step: "0.1" })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading && <LoadingSpinner size="sm" />}
          {loading ? loadingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
