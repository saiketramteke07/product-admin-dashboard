import axios, { CancelToken } from "axios";
import axiosInstance from "./axios";
import {
  Product,
  ProductListResponse,
  Category,
  ProductFormValues,
} from "@/types/product";

export const productApi = {
  getProducts: (
    limit: number,
    skip: number,
    cancelToken?: CancelToken
  ): Promise<ProductListResponse> =>
    axiosInstance
      .get<ProductListResponse>("/products", {
        params: { limit, skip },
        cancelToken,
      })
      .then((res) => res.data),

  searchProducts: (
    q: string,
    limit: number,
    skip: number,
    cancelToken?: CancelToken
  ): Promise<ProductListResponse> =>
    axiosInstance
      .get<ProductListResponse>("/products/search", {
        params: { q, limit, skip },
        cancelToken,
      })
      .then((res) => res.data),

  getProductsByCategory: (
    category: string,
    limit: number,
    skip: number,
    cancelToken?: CancelToken
  ): Promise<ProductListResponse> =>
    axiosInstance
      .get<ProductListResponse>(`/products/category/${category}`, {
        params: { limit, skip },
        cancelToken,
      })
      .then((res) => res.data),

  getCategories: (): Promise<Category[]> =>
    axiosInstance.get<Category[]>("/products/categories").then((res) => res.data),

  getProduct: (id: number): Promise<Product> =>
    axiosInstance.get<Product>(`/products/${id}`).then((res) => res.data),

  createProduct: (data: Partial<ProductFormValues>): Promise<Product> =>
    axiosInstance
      .post<Product>("/products/add", data)
      .then((res) => res.data),

  updateProduct: (id: number, data: Partial<ProductFormValues>): Promise<Product> =>
    axiosInstance
      .put<Product>(`/products/${id}`, data)
      .then((res) => res.data),

  deleteProduct: (id: number): Promise<{ isDeleted: boolean; id: number }> =>
    axiosInstance
      .delete<{ isDeleted: boolean; id: number }>(`/products/${id}`)
      .then((res) => res.data),
};

// Re-export CancelToken source creator for convenience
export const createCancelToken = () => axios.CancelToken.source();
export const isCancel = axios.isCancel;
