"use client";

import {
  ArrowRight,
  Star,
  ShoppingCart,
  TrendingUp,
  Package2,
} from "lucide-react";
import Link from "next/link";
import SafeImage from "@/components/ui/safe-image";
import { useTopSellingProducts } from "@/hooks/use-products";
import { useCart } from "@/lib/store/cart-store";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { toast } from "sonner";

interface TopSellingProductsProps {
  limit?: number;
  period?: "week" | "month" | "year" | "all";
  showHeader?: boolean;
  className?: string;
}

const TopSellingProducts = ({
  limit = 4,
  period = "month",
  showHeader = true,
  className = "",
}: TopSellingProductsProps) => {
  const { addItem } = useCart();
  const {
    data: topSellingProducts,
    isLoading,
    error,
  } = useTopSellingProducts({
    limit,
    period,
    includeCategory: true,
  });

  // Error state
  if (error) {
    return (
      <div className={`bg-gray-50 px-4 py-10 md:py-16 ${className}`}>
        <div className="mx-auto max-w-6xl">
          {showHeader && (
            <div className="mb-8 md:mb-10">
              <h2 className="text-sonno-navy mb-2 flex items-center text-2xl font-bold md:text-3xl">
                <TrendingUp className="mr-3 h-6 w-6 text-green-600" />
                Top Selling Products
              </h2>
              <p className="max-w-2xl text-gray-600">
                Discover what our customers love most - our best-selling
                furniture and home essentials.
              </p>
            </div>
          )}

          <div className="py-8 text-center">
            <p className="text-red-600">
              Failed to load top selling products. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-50 px-4 py-10 md:py-16 ${className}`}>
        <div className="mx-auto max-w-6xl">
          {showHeader && (
            <div className="mb-8 md:mb-10">
              <h2 className="text-sonno-navy mb-2 flex items-center text-2xl font-bold md:text-3xl">
                <TrendingUp className="mr-3 h-6 w-6 text-green-600" />
                Top Selling Products
              </h2>
              <p className="max-w-2xl text-gray-600">
                Discover what our customers love most - our best-selling
                furniture and home essentials.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-lg bg-gray-100"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No sales data state (empty array)
  if (!topSellingProducts || topSellingProducts.length === 0) {
    return (
      <div className={`bg-gray-50 px-4 py-10 md:py-16 ${className}`}>
        <div className="mx-auto max-w-6xl">
          {showHeader && (
            <div className="mb-8 md:mb-10">
              <h2 className="text-sonno-navy mb-2 flex items-center text-2xl font-bold md:text-3xl">
                <TrendingUp className="mr-3 h-6 w-6 text-green-600" />
                Top Selling Products
              </h2>
              <p className="max-w-2xl text-gray-600">
                Discover what our customers love most - our best-selling
                furniture and home essentials.
              </p>
            </div>
          )}

          <div className="py-12 text-center">
            <div className="relative mb-6">
              <div className="bg-muted mx-auto flex h-24 w-24 items-center justify-center rounded-full">
                <Package2 className="text-muted-foreground h-12 w-12" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold">No Sales Yet</h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              We haven&apos;t recorded any sales for this period yet. Check out
              our featured products or browse our full catalog instead.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/products"
                className="bg-sonno-navy hover:bg-sonno-navy/90 inline-flex items-center rounded-md px-6 py-3 font-medium text-white transition-colors"
              >
                Browse All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 px-4 py-10 md:py-16 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {showHeader && (
          <div className="mb-8 md:mb-10">
            <h2 className="text-sonno-navy mb-2 flex items-center text-2xl font-bold md:text-3xl">
              <TrendingUp className="mr-3 h-6 w-6 text-green-600" />
              Top Selling Products
            </h2>
            <p className="max-w-2xl text-gray-600">
              Discover what our customers love most - our best-selling furniture
              and home essentials.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {topSellingProducts.map((product, index) => {
            // Use default_variant price or base_price as fallback
            const productPrice = product.default_variant.price;
            const isOnSale = productPrice < product.base_price;

            return (
              <div
                key={product.id}
                className="relative flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-all hover:shadow-lg"
              >
                {/* Bestseller Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div className="flex items-center rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">
                    <TrendingUp className="mr-1 h-3 w-3" />#{index + 1}{" "}
                    Bestseller
                  </div>
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="relative block"
                >
                  <div className="group aspect-square overflow-hidden bg-gray-100">
                    <SafeImage
                      src={product.main_image.url || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {isOnSale && (
                      <div className="absolute top-3 right-3 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                        SALE
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex flex-grow flex-col p-4 md:p-6">
                  <Link href={`/products/${product.id}`} className="group">
                    <h3 className="text-sonno-navy group-hover:text-primary mb-1 text-lg font-semibold transition-colors md:text-xl">
                      {product.name}
                    </h3>
                  </Link>

                  {product.category && (
                    <div className="text-sonno-navy mt-1 mb-2 inline-flex w-fit items-center rounded bg-blue-100 px-2 py-1 text-xs md:text-sm">
                      {product.category.name}
                    </div>
                  )}

                  {/* Sales count */}
                  <div className="mb-2 text-sm font-medium text-green-600">
                    {product.sales_data.total_units_sold} sold •{" "}
                    {product.sales_data.order_count} orders
                  </div>

                  <div className="mb-3 flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-2 text-xs text-gray-600">(5.0/5)</span>
                  </div>

                  <div className="mt-auto mb-4">
                    {isOnSale ? (
                      <>
                        <div className="text-sm text-gray-500 line-through">
                          £{product.base_price.toFixed(2)}
                        </div>
                        <div className="text-sonno-navy text-xl font-bold md:text-2xl">
                          £{productPrice.toFixed(2)}
                        </div>
                        <div className="text-sm font-medium text-red-600">
                          Save £{(product.base_price - productPrice).toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <div className="text-sonno-navy text-xl font-bold md:text-2xl">
                        £{productPrice.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="border-sonno-navy text-sonno-navy hover:bg-sonno-navy/10 inline-flex flex-1 items-center justify-center rounded-md border bg-white py-2 text-sm font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          await addItem({
                            id: product.default_variant.id,
                            name: product.name,
                            price: productPrice,
                            image: product.main_image.url,
                            variant_id: product.default_variant.id,
                            color: product.default_variant.color,
                            size: product.default_variant.size,
                            stock: product.default_variant.stock,
                          });
                          toast.success(`${product.name} added to cart!`);
                        } catch (error) {
                          console.error("Failed to add to cart:", error);
                          toast.error("Failed to add to cart");
                        }
                      }}
                      className="bg-sonno-navy hover:bg-sonno-navy/90 flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-medium text-white"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <WishlistButton
                      variant_id={product.default_variant.id}
                      product={{
                        name: product.name,
                        price: productPrice,
                        image: product.main_image.url,
                        color: product.default_variant.color,
                        size: product.default_variant.size,
                        stock: product.default_variant.stock,
                      }}
                      size="sm"
                      variant="outline"
                      className="px-2"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showHeader && (
          <div className="mt-8 text-center md:mt-10">
            <Link
              href="/products"
              className="border-sonno-navy text-sonno-navy hover:bg-sonno-navy inline-flex items-center rounded-md border bg-white px-5 py-2 font-medium transition-colors hover:text-white md:px-6 md:py-3"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopSellingProducts;
