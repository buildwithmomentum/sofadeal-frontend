import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  createProductVariant,
  getFeaturedProducts,
  getTopSellingProducts,
  getProductsWithLowStock,
  getRelatedProducts,
  ProductCreateInput,
  ProductUpdateInput,
} from "@/lib/api/products";
import { toast } from "sonner";

// Hook for fetching products with optional filtering
export function useProducts(params?: {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  includeVariants?: boolean;
  includeImages?: boolean;
  includeCategory?: boolean;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}

// Hook for fetching a single product by ID
export function useProduct(
  id: string,
  params?: {
    includeVariants?: boolean;
    includeImages?: boolean;
    includeCategory?: boolean;
  }
) {
  return useQuery({
    queryKey: ["products", id, params],
    queryFn: () => getProductById(id, params),
    enabled: !!id, // Only run the query if id is provided
  });
}

// Hook for creating a new product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreateInput) => createProduct(data),
    onSuccess: () => {
      // Invalidate products queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create product", {
        description: error.message,
      });
    },
  });
}

// Hook for updating a product
export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductUpdateInput) => updateProduct(id, data),
    onSuccess: () => {
      // Invalidate specific product and all products queries
      queryClient.invalidateQueries({ queryKey: ["products", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update product", {
        description: error.message,
      });
    },
  });
}

// Hook for deleting a product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      // Invalidate products queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete product", {
        description: error.message,
      });
    },
  });
}

// Hook for fetching product variants
export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: ["products", productId, "variants"],
    queryFn: () => getProductVariants(productId),
    enabled: !!productId, // Only run the query if productId is provided
  });
}

// Hook for creating a product variant
export function useCreateProductVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      sku: string;
      price: number;
      size?: string;
      color?: string;
      stock: number;
    }) => createProductVariant(productId, data),
    onSuccess: () => {
      // Invalidate variants queries to refetch data
      queryClient.invalidateQueries({
        queryKey: ["products", productId, "variants"],
      });
      queryClient.invalidateQueries({ queryKey: ["products", productId] });
      toast.success("Variant created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create variant", {
        description: error.message,
      });
    },
  });
}

// Hook for fetching featured products
export function useFeaturedProducts(params?: {
  limit?: number;
  includeCategory?: boolean;
}) {
  return useQuery({
    queryKey: ["featuredProducts", params],
    queryFn: () => getFeaturedProducts(params),
  });
}

// Hook for fetching top selling products
export function useTopSellingProducts(params?: {
  limit?: number;
  period?: "week" | "month" | "year" | "all";
  includeCategory?: boolean;
}) {
  return useQuery({
    queryKey: ["topSellingProducts", params],
    queryFn: () => getTopSellingProducts(params),
  });
}

// Hook for fetching products with low stock
export function useLowStockProducts(params?: {
  threshold?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["lowStockProducts", params],
    queryFn: () => getProductsWithLowStock(params),
  });
}

// Hook for fetching related products
export function useRelatedProducts(
  productId: string,
  params?: {
    limit?: number;
    includeCategory?: boolean;
  }
) {
  return useQuery({
    queryKey: ["relatedProducts", productId, params],
    queryFn: () => getRelatedProducts(productId, params),
    enabled: !!productId, // Only run the query if productId is provided
  });
}
