"use client";

import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/hooks/use-products";
import { useSearchStore } from "@/lib/store/search-store";
import { useSearchParams, useRouter } from "next/navigation";
import { Product } from "@/lib/api/products";

import { useEffect, Suspense } from "react";
import React from "react";
import { MarqueeStrip } from "@/components/marquee-strip";
import { Button } from "@/components/button-custom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

import Image from "next/image";

// Product interface for this page
interface PageProduct {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  type?: string;
  rating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  discount?: number;
  image?: string;
  // Add variant information for cart/wishlist functionality
  variantId?: string;
  size?: string;
  color?: string;
  stock?: number;
}

// Category interface for filter dropdown
interface FilterCategory {
  id: string;
  name: string;
  slug: string;
}

// Loading component for Suspense fallback
function ProductsLoading() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative">
        {/* Light blue background for right side extending from navbar */}
        <div className="absolute inset-0 hidden w-full overflow-hidden lg:block">
          <div className="relative mx-auto h-full px-4">
            <div className="bg-light-blue absolute right-0 mt-[-70px] h-full md:w-[50%] 2xl:w-[50%]"></div>
          </div>
        </div>

        <div className="relative min-h-[400px] overflow-hidden sm:min-h-[500px] md:min-h-[640px] 2xl:min-h-[820px]">
          {/* Hero Image - Background for entire section */}
          <div className="absolute inset-0 h-full w-full md:mt-[-80px] md:ml-[46px] 2xl:mt-[0px] 2xl:ml-[68px]">
            <Image
              src="/product-img1.png"
              alt="Sofa Deals Product Page"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="absolute left-4 flex-col justify-center px-[32px] py-8 sm:py-12 md:bottom-[4px] md:mt-[-60px] md:py-16 lg:py-26 2xl:bottom-[-50px] 2xl:mt-[0px]">
            <div className="max-w-full sm:max-w-md lg:max-w-xl 2xl:max-w-2xl">
              <h1 className="sm:text-[85px]">OUR PRODUCTS</h1>
              <p className="font-open-sans mb-8 text-sm leading-relaxed text-[#999] sm:text-base">
                Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing El Mauris
                Accumsan Volutpat Semper. Quisque Hendrerit Justo Quis Euismod
                Pretium.
              </p>
              <Button
                variant="main"
                size="xl"
                rounded="full"
                className="bg-blue relative items-center justify-start"
                icon={
                  <Image
                    src="/arrow-right.png"
                    alt="arrow-right"
                    width={20}
                    height={20}
                    className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 sm:h-[40px] sm:w-[40px]"
                  />
                }
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Strip */}
      <MarqueeStrip
        items={[
          { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
          { text: "100-NIGHT TRIAL", icon: "/sofa-icon.png" },
          { text: "EASY RETURN", icon: "/sofa-icon.png" },
          { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
          { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
        ]}
        speed={30}
        direction="left"
        backgroundColor="bg-blue"
        textColor="text-white"
        className="py-3 sm:py-4 md:mt-[-70px] 2xl:mt-[0px]"
      />

      {/* Loading Products Section */}
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="px-[32px]">
          <div className="mb-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="h-16 w-[280px] animate-pulse rounded-full bg-gray-200"></div>
                <div className="h-16 w-[280px] animate-pulse rounded-full bg-gray-200"></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-lg bg-gray-200"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main products content component that uses useSearchParams
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for filters and sorting
  const [sortOption, setSortOption] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("categoryId") || "all"
  );
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch all products to get available categories (without pagination for category extraction)
  const { data: allProductsData } = useProducts({
    includeCategory: true,
    limit: 500, // Get enough products to capture all categories
  });

  // Handle URL parameter changes (e.g., when coming from featured categories)
  useEffect(() => {
    const categoryIdFromUrl = searchParams.get("categoryId");
    console.log("URL categoryId:", categoryIdFromUrl);
    console.log("Current selectedCategory:", selectedCategory);
    if (categoryIdFromUrl) {
      setSelectedCategory(categoryIdFromUrl);
      setCurrentPage(1); // Reset to first page when category changes
    } else {
      setSelectedCategory("all");
    }
  }, [searchParams]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedPrice, sortOption]);

  // Handle category change with URL update
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);

    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === "all") {
      params.delete("categoryId");
    } else {
      params.set("categoryId", categoryId);
    }

    // Navigate to new URL without page reload
    const newUrl = params.toString() ? `?${params.toString()}` : "/products";
    router.push(newUrl, { scroll: false });
  };

  // Extract available categories from all products
  const availableCategories = React.useMemo((): FilterCategory[] => {
    if (!allProductsData?.items) return [];

    const categoryMap = new Map<string, FilterCategory>();
    allProductsData.items.forEach((product: Product) => {
      if (product.category) {
        categoryMap.set(product.category.id, {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [allProductsData]);

  // Use the React Query hook with pagination and filtering
  const {
    data: apiProducts,
    isLoading: isProductsLoading,
    error,
  } = useProducts({
    includeImages: true,
    includeCategory: true,
    includeVariants: true,
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    page: currentPage,
    limit: itemsPerPage,
    sortBy:
      sortOption === "price-low-high"
        ? "price"
        : sortOption === "price-high-low"
          ? "price"
          : sortOption === "rating"
            ? "rating"
            : "id",
    sortOrder: sortOption === "price-high-low" ? "desc" : "asc",
  });

  // Marquee items data
  const marqueeItems = [
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
    { text: "100-NIGHT TRIAL", icon: "/sofa-icon.png" },
    { text: "EASY RETURN", icon: "/sofa-icon.png" },
    { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
  ];

  // Define types for API response
  interface ApiProductImage {
    id: string;
    url: string;
    type: string;
    order: number;
  }

  interface ApiProductVariant {
    id: string;
    sku: string;
    size: string;
    color: string;
    price: number;
    stock: number;
    featured?: boolean;
    material?: string;
    brand?: string;
    tags?: string;
  }

  interface ApiProduct {
    id: string;
    name: string;
    description: string;
    base_price: number;
    category?: {
      name: string;
      slug: string;
    };
    images?: ApiProductImage[];
    variants?: ApiProductVariant[];
  }

  // Transform API data to match component interface
  const transformedProducts: PageProduct[] =
    apiProducts?.items && Array.isArray(apiProducts.items)
      ? apiProducts.items.map((product: ApiProduct) => {
          // Find the main image or use the first image
          const mainImage = product.images?.find(
            (img: ApiProductImage) => img.type === "main"
          );
          const firstImage = product.images?.[0];
          const imageUrl =
            mainImage?.url || firstImage?.url || "/placeholder.svg";

          // Select the best variant to display
          // Priority: featured variant > first available variant > first variant
          let selectedVariant = product.variants?.[0]; // fallback
          if (product.variants && product.variants.length > 0) {
            const featuredVariant = product.variants.find((v) => v.featured);
            const availableVariant = product.variants.find((v) => v.stock > 0);
            selectedVariant =
              featuredVariant || availableVariant || product.variants[0];
          }

          return {
            id: product.id,
            name: product.name || "Turkish Sofa",
            price: selectedVariant?.price || product.base_price || 699,
            category: product.category?.name || "Sofas",
            type: product.category?.name || "3 Seater",
            rating: 4.9, // Static for now since API doesn't provide ratings
            inStock: selectedVariant ? selectedVariant.stock > 0 : true,
            isFeatured: selectedVariant?.featured || true,
            isNew: false, // Static for now
            isSale: true, // Static for now
            discount: 15, // Static for now
            image: imageUrl,
            // Add variant information for cart/wishlist functionality
            variantId: selectedVariant?.id,
            size: selectedVariant?.size,
            color: selectedVariant?.color,
            stock: selectedVariant?.stock,
          };
        })
      : [];

  // Get search term from store if available
  const searchTerm = useSearchStore((state) => state.searchQuery);

  // Simple fuzzy search function
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query || !text) return false;

    const normalizedText = text.toLowerCase().trim();
    const normalizedQuery = query.toLowerCase().trim();

    // Exact match
    if (normalizedText.includes(normalizedQuery)) return true;

    // Split both text and query into words for better matching
    const textWords = normalizedText.split(/\s+/);
    const queryWords = normalizedQuery.split(/\s+/);

    // Check if any query word matches any text word
    return queryWords.some((queryWord) => {
      return textWords.some((textWord) => {
        return textWord.includes(queryWord) || queryWord.includes(textWord);
      });
    });
  };

  // Filter and search products
  let filteredProducts = transformedProducts;

  // Apply search filter
  if (searchTerm && searchTerm.trim()) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        fuzzyMatch(product.name, searchTerm) ||
        fuzzyMatch(product.category || "", searchTerm) ||
        fuzzyMatch(product.type || "", searchTerm) ||
        fuzzyMatch(product.color || "", searchTerm) ||
        fuzzyMatch(product.size || "", searchTerm)
    );
  }

  // Note: Category filtering is handled by the backend API via the categoryId parameter
  // No need for additional frontend filtering since the API already returns filtered results

  // Apply price filter
  if (selectedPrice !== "all") {
    filteredProducts = filteredProducts.filter((product) => {
      switch (selectedPrice) {
        case "under-500":
          return product.price < 500;
        case "500-1000":
          return product.price >= 500 && product.price <= 1000;
        case "1000-2000":
          return product.price >= 1000 && product.price <= 2000;
        case "over-2000":
          return product.price > 2000;
        default:
          return true;
      }
    });
  }

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        // For newest, we could use creation date if available, for now use isNew flag
        return a.isNew ? -1 : b.isNew ? 1 : 0;
      case "stock":
        // Sort by stock availability (in stock first, then by stock quantity)
        const aStock = a.stock || 0;
        const bStock = b.stock || 0;
        if (aStock > 0 && bStock === 0) return -1;
        if (bStock > 0 && aStock === 0) return 1;
        return bStock - aStock;
      case "featured":
      default:
        // Featured products first, then by availability
        if (a.isFeatured && !b.isFeatured) return -1;
        if (b.isFeatured && !a.isFeatured) return 1;
        // If both are featured or both are not, sort by stock
        const aInStock = a.inStock ? 1 : 0;
        const bInStock = b.inStock ? 1 : 0;
        return bInStock - aInStock;
    }
  });

  // Remove full page loading - we'll show hero section and loading state for products only

  if (error) {
    return (
      <div className="container-1440 px-4 py-12">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>Error loading products. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative">
        {/* Light blue background for right side extending from navbar */}
        <div className="absolute inset-0 hidden w-full overflow-hidden lg:block">
          <div className="relative mx-auto h-full px-4">
            <div className="bg-light-blue absolute right-0 mt-[-70px] h-full md:w-[50%] 2xl:w-[50%]"></div>
          </div>
        </div>

        <div className="relative min-h-[400px] overflow-hidden sm:min-h-[500px] md:min-h-[640px] 2xl:min-h-[820px]">
          {/* Hero Image - Background for entire section */}
          <div className="absolute inset-0 h-full w-full md:mt-[-80px] md:ml-[46px] 2xl:mt-[0px] 2xl:ml-[68px]">
            <Image
              src="/product-img1.png"
              alt="Sofa Deals Product Page"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="absolute left-4 flex-col justify-center px-[32px] py-8 sm:py-12 md:bottom-[4px] md:mt-[-60px] md:py-16 lg:py-26 2xl:bottom-[-50px] 2xl:mt-[0px]">
            <div className="max-w-full sm:max-w-md lg:max-w-xl 2xl:max-w-2xl">
              <h1 className="sm:text-[85px]">OUR PRODUCTS</h1>
              <p className="font-open-sans mb-8 text-sm leading-relaxed text-[#999] sm:text-base">
                Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing El Mauris
                Accumsan Volutpat Semper. Quisque Hendrerit Justo Quis Euismod
                Pretium.
              </p>
              <Button
                variant="main"
                size="xl"
                rounded="full"
                className="bg-blue relative items-center justify-start"
                icon={
                  <Image
                    src="/arrow-right.png"
                    alt="arrow-right"
                    width={20}
                    height={20}
                    className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 sm:h-[40px] sm:w-[40px]"
                  />
                }
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Strip */}
      <MarqueeStrip
        items={marqueeItems}
        speed={30}
        direction="left"
        backgroundColor="bg-blue"
        textColor="text-white"
        className="py-3 sm:py-4 md:mt-[-70px] 2xl:mt-[0px]"
      />

      {/* Products Section */}
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="px-[32px]">
          {/* Filters and Sort Bar */}
          <div id="filters-section" className="mb-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              {/* Left side - Filters */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-start text-sm font-medium tracking-wide text-gray-400 uppercase">
                    CATEGORIES
                  </span>
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="text-blue border-blue hover:border-blue focus:border-blue h-16 w-[280px] rounded-full border-1 px-4">
                      <SelectValue placeholder="Select" className="text-blue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {availableCategories?.map((category: FilterCategory) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col items-start gap-2">
                  <span className="text-sm font-medium tracking-wide text-gray-400 uppercase">
                    PRICES
                  </span>
                  <Select
                    value={selectedPrice}
                    onValueChange={setSelectedPrice}
                  >
                    <SelectTrigger className="text-blue border-blue hover:border-blue focus:border-blue h-16 w-[280px] rounded-full border-1 px-4">
                      <SelectValue placeholder="Select" className="text-blue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-500">Under £500</SelectItem>
                      <SelectItem value="500-1000">£500 - £1000</SelectItem>
                      <SelectItem value="1000-2000">£1000 - £2000</SelectItem>
                      <SelectItem value="over-2000">Over £2000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right side - Sort and View */}

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="flex h-auto w-auto items-center gap-1 border-0 bg-transparent p-0 shadow-none focus:ring-0">
                      <span className="text-sm font-medium text-[#999]">
                        Sort By
                      </span>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-lg">
                      <SelectItem value="featured" className="rounded-lg">
                        Featured
                      </SelectItem>
                      <SelectItem value="price-low-high" className="rounded-lg">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high-low" className="rounded-lg">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="rating" className="rounded-lg">
                        Top Rated
                      </SelectItem>
                      <SelectItem value="stock" className="rounded-lg">
                        Stock Availability
                      </SelectItem>
                      <SelectItem value="newest" className="rounded-lg">
                        Newest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {sortOption !== "featured" && (
                    <span className="ml-2 text-sm font-medium text-gray-800">
                      {sortOption === "price-low-high" && "Price: Low to High"}
                      {sortOption === "price-high-low" && "Price: High to Low"}
                      {sortOption === "rating" && "Top Rated"}
                      {sortOption === "stock" && "Stock Availability"}
                      {sortOption === "newest" && "Newest"}
                    </span>
                  )}
                </div>

                {/* View Mode Toggle - Hidden on small screens */}
                <div className="hidden items-center md:flex">
                  <button
                    onClick={() => setViewMode("grid")}
                    className="border-gray border p-3"
                  >
                    <Image
                      src={viewMode === "grid" ? "/l-11.png" : "/l-1.png"}
                      alt="Grid view"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </button>
                  <button
                    onClick={() => setViewMode("grid-small")}
                    className="border-gray border-y border-r p-3"
                  >
                    <Image
                      src={viewMode === "grid-small" ? "/l-22.png" : "/l-2.png"}
                      alt="Small grid view"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className="border-gray border-y border-r p-3"
                  >
                    <Image
                      src={viewMode === "list" ? "/l-33.png" : "/l-3.png"}
                      alt="List view"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </button>
                  <button
                    onClick={() => setViewMode("list-detailed")}
                    className="border-gray border-y border-r p-3"
                  >
                    <Image
                      src={
                        viewMode === "list-detailed" ? "/l-44.png" : "/l-4.png"
                      }
                      alt="Detailed list view"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isProductsLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-lg bg-gray-200"
                ></div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : viewMode === "grid-small"
                    ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-4"
                    : viewMode === "list"
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1"
              }`}
            >
              {sortedProducts.map((product, index) => {
                // Calculate discount percentage
                const originalPrice = Math.round(product.price * 1.25);
                const discountPercentage = Math.round(
                  ((originalPrice - product.price) / originalPrice) * 100
                );

                return (
                  <ProductCard
                    variant={index % 2 === 0 ? "layout1" : "layout2"} // Alternating layouts
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={originalPrice}
                    imageSrc={product.image}
                    rating={product.rating || 4.9}
                    discount={`${discountPercentage}% off`}
                    deliveryInfo="3 To 4 Days Delivery"
                    paymentOption={{
                      service: "Klarna",
                      installments: 3,
                      amount: Math.round((product.price / 3) * 100) / 100,
                    }}
                    isSale={product.isSale}
                    className={
                      viewMode === "list-detailed" ? "list-detailed-view" : ""
                    }
                    // Pass variant information for cart/wishlist functionality
                    variantId={product.variantId}
                    size={product.size}
                    color={product.color}
                    stock={product.stock}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border bg-white py-12 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="mx-auto mt-2 max-w-md text-gray-500">
                We couldn&apos;t find any products matching your current
                filters. Try adjusting your search or filter criteria.
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-4"
                onClick={() => {
                  handleCategoryChange("all");
                  setSelectedPrice("all");
                  setSortOption("featured");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}

          {/* Pagination Controls */}
          {!isProductsLoading &&
            apiProducts?.meta &&
            apiProducts.meta.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setCurrentPage(Math.max(1, currentPage - 1));
                    document
                      .getElementById("filters-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, apiProducts.meta.totalPages) },
                    (_, i) => {
                      const pageNumber =
                        Math.max(
                          1,
                          Math.min(
                            apiProducts.meta.totalPages - 4,
                            Math.max(1, currentPage - 2)
                          )
                        ) + i;

                      if (pageNumber > apiProducts.meta.totalPages) return null;

                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            currentPage === pageNumber ? "primary" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setCurrentPage(pageNumber);
                            document
                              .getElementById("filters-section")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="h-10 w-10 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setCurrentPage(
                      Math.min(apiProducts.meta.totalPages, currentPage + 1)
                    );
                    document
                      .getElementById("filters-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  disabled={currentPage === apiProducts.meta.totalPages}
                  className="px-4 py-2"
                >
                  Next
                </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}
