import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "@/lib/api-service";

// Mock API functions - removed dummy data, now returns empty array
// In a real application, these would make actual API calls
const fetchProducts = async (): Promise<
  { id: number; name: string; price: number }[]
> => {
  // This would be a real API call in production
  // Returning empty array since we're using real API endpoints now
  return [];
};

const fetchProductById = async (id: number) => {
  // This would be a real API call
  const products = await fetchProducts();
  const product = products.find((product) => product.id === id);

  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }

  return product;
};

// React Query hooks
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: !!id, // Only run the query if we have an ID
  });
}

// Example mutation
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      // This would be a real API call to add item to cart
      console.log(`Added product ${productId} to cart`);
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate queries that might be affected
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

// Product type definitions
export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  base_price: number;
  delivery_info?: {
    min_days?: number;
    max_days?: number;
    text?: string;
    shipping_method?: string;
    free_shipping_threshold?: number;
  };
  warranty_info?: string;
  care_instructions?: string;
  assembly_required?: boolean;
  assembly_instructions?: string;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price: number;
  compare_price?: number;
  discount_percentage?: number;
  size: string;
  color: string;
  stock: number;
  weight_kg?: number;
  dimensions?: {
    width?: { cm: number; inches: number };
    depth?: { cm: number; inches: number };
    height?: { cm: number; inches: number };
    seat_width?: { cm: number; inches: number };
    seat_depth?: { cm: number; inches: number };
    seat_height?: { cm: number; inches: number };
    bed_width?: { cm: number; inches: number };
    bed_length?: { cm: number; inches: number };
  };
  payment_options?: Array<{
    provider: string;
    description: string;
    installments?: number;
    amount?: number;
  }>;
  tags?: string;
  material?: string;
  brand?: string;
  featured?: boolean;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  type: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  order: number;
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  category_id?: string;
  base_price: number;
  default_color?: string;
  default_size?: string;
  initial_stock?: number;
  default_sku?: string;
  tags?: string;
  material?: string;
  brand?: string;
  featured?: boolean;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  category_id?: string;
  base_price?: number;
}

// Featured Product interfaces for the optimized API response
export interface FeaturedProductImage {
  id: string;
  url: string;
}

export interface FeaturedProductVariant {
  id: string;
  sku: string;
  price: number;
  color: string;
  size: string;
  stock: number;
  featured: boolean;
}

export interface FeaturedProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  category_id: string;
  base_price: number;
  main_image: FeaturedProductImage;
  default_variant: FeaturedProductVariant;
  category?: FeaturedProductCategory;
}

// Top Selling Product interfaces for the optimized API response
export interface TopSellingProductImage {
  id: string;
  url: string;
}

export interface TopSellingProductVariant {
  id: string;
  sku: string;
  price: number;
  color: string;
  size: string;
  stock: number;
  featured: boolean;
}

export interface TopSellingProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface TopSellingProductSalesData {
  order_count: number;
  total_units_sold: number;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  category_id: string;
  base_price: number;
  main_image: TopSellingProductImage;
  default_variant: TopSellingProductVariant;
  sales_data: TopSellingProductSalesData;
  category?: TopSellingProductCategory;
}

// Get all products with optional filtering
export async function getProducts(params?: {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  includeVariants?: boolean;
  includeImages?: boolean;
  includeCategory?: boolean;
}): Promise<{
  items: Product[];
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
}> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await ApiService.fetchPublic(
    `/products?${queryParams.toString()}`
  );

  return ApiService.handleResponse(response, "Failed to fetch products");
}

// Get a single product by ID with enhanced details
export async function getProductById(
  id: string,
  params?: {
    includeVariants?: boolean;
    includeImages?: boolean;
    includeCategory?: boolean;
  }
): Promise<
  Product & {
    variants?: ProductVariant[];
    images?: ProductImage[];
    category?: Category & { parent?: Category };
  }
> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await ApiService.fetchPublic(
    `/products/${id}?${queryParams.toString()}`
  );

  return ApiService.handleResponse(response, `Failed to fetch product: ${id}`);
}

// Get product variants
export async function getProductVariants(
  productId: string
): Promise<ProductVariant[]> {
  const response = await ApiService.fetchPublic(
    `/products/${productId}/variants`
  );

  return ApiService.handleResponse(
    response,
    `Failed to fetch product variants for product: ${productId}`
  );
}

// Get related products
export async function getRelatedProducts(
  productId: string,
  params?: {
    limit?: number;
    includeCategory?: boolean;
  }
): Promise<Product[]> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await ApiService.fetchPublic(
    `/products/related/${productId}?${queryParams.toString()}`
  );

  return ApiService.handleResponse(
    response,
    `Failed to fetch related products for: ${productId}`
  );
}

// Create a new product
export async function createProduct(
  data: ProductCreateInput
): Promise<Product> {
  const response = await ApiService.fetchWithAuth("/products/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return ApiService.handleResponse(response, "Failed to create product");
}

// Update a product
export async function updateProduct(
  id: string,
  data: ProductUpdateInput
): Promise<Product> {
  const response = await ApiService.fetchWithAuth(
    `/products/admin/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

  return ApiService.handleResponse(response, `Failed to update product: ${id}`);
}

// Delete a product
export async function deleteProduct(id: string): Promise<Product> {
  const response = await ApiService.fetchWithAuth(
    `/products/admin/products/${id}`,
    {
      method: "DELETE",
    }
  );

  return ApiService.handleResponse(response, `Failed to delete product: ${id}`);
}

// Get featured products
export async function getFeaturedProducts(params?: {
  limit?: number;
  includeCategory?: boolean;
}): Promise<FeaturedProduct[]> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await ApiService.fetchPublic(
    `/products/featured?${queryParams.toString()}`
  );

  return ApiService.handleResponse(
    response,
    "Failed to fetch featured products"
  );
}

// Get top selling products
export async function getTopSellingProducts(params?: {
  limit?: number;
  period?: "week" | "month" | "year" | "all";
  includeCategory?: boolean;
}): Promise<TopSellingProduct[]> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await ApiService.fetchPublic(
    `/products/top-sellers?${queryParams.toString()}`
  );

  return ApiService.handleResponse(
    response,
    "Failed to fetch top selling products"
  );
}

// Create product variant
export async function createProductVariant(
  productId: string,
  data: {
    sku: string;
    price: number;
    size?: string;
    color?: string;
    stock: number;
  }
): Promise<ProductVariant> {
  const response = await ApiService.fetchWithAuth(
    `/products/admin/products/${productId}/variants`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return ApiService.handleResponse(
    response,
    `Failed to create product variant for product: ${productId}`
  );
}

// Get products with low stock
export async function getProductsWithLowStock(params?: {
  threshold?: number;
  limit?: number;
}): Promise<Product[]> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await ApiService.fetchWithAuth(
    `/admin/products/low-stock?${queryParams.toString()}`
  );

  return ApiService.handleResponse(
    response,
    "Failed to fetch products with low stock"
  );
}
