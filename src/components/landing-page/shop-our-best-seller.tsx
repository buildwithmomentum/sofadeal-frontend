"use client";

import { useFeaturedProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { Button } from "../button-custom";
import Image from "next/image";

const ShopOurBestSeller = () => {
  const {
    data: featuredProducts,
    isLoading,
    error,
  } = useFeaturedProducts({
    limit: 3,
    includeCategory: true,
  });

  // Error state
  if (error) {
    return (
      <div className="py-10 md:py-16">
        <div className="px-[32px]">
          <div className="mb-8 md:mb-10">
            <h1>SHOP OUR BEST SELLER</h1>
          </div>

          <div className="py-8 text-center">
            <p className="font-open-sans text-red-600">
              Failed to load featured products. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !featuredProducts || featuredProducts.length === 0) {
    return (
      <div className="py-10 md:py-16">
        <div className="px-[32px]">
          <div className="mb-8 md:mb-10">
            <h1>SHOP OUR BEST SELLER</h1>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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

  return (
    <div className="py-10 md:py-16">
      <div className="px-[32px] py-20">
        <div className="mb-8 flex justify-between md:mb-10">
          <h1 className="text-4xl lg:text-[85px]">SHOP OUR BEST SELLER</h1>
          <Link href="/products">
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
              View More
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {featuredProducts.map((product, index) => {
            // Get the variant price or use base price as fallback
            const currentPrice =
              product.default_variant?.price || product.base_price;
            const hasDiscount = currentPrice < product.base_price;

            // Get main image URL with validation
            const getValidImageUrl = (imageUrl?: string) => {
              try {
                if (imageUrl && typeof imageUrl === "string") {
                  // Check if it's a valid URL or relative path
                  if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
                    return imageUrl;
                  }
                }
                return "/hero-img.png"; // Fallback to hero image
              } catch (error) {
                console.warn("Error processing product image:", error);
                return "/hero-img.png";
              }
            };

            const productImage = getValidImageUrl(product.main_image?.url);

            // Calculate discount percentage if there's a discount
            let discountPercentage = "";
            if (hasDiscount) {
              const percentage = Math.round(
                ((product.base_price - currentPrice) / product.base_price) * 100
              );
              discountPercentage = `${percentage}% off`;
            }

            return (
              <ProductCard
                variant={index % 2 === 0 ? "layout1" : "layout2"} // Alternating layouts
                key={product.id}
                id={product.id}
                name={product.name || "SUNSET TURKISH SOFA"} // Fallback name
                price={currentPrice}
                originalPrice={
                  hasDiscount
                    ? product.base_price
                    : Math.round(currentPrice * 1.25)
                } // Always provide original price
                imageSrc={productImage}
                rating={4.9} // Static rating since API might not have it
                discount={discountPercentage || "15% off"} // Use calculated or static discount
                deliveryInfo="3 To 4 Days Delivery" // Static delivery info to match image
                paymentOption={{
                  service: "Klarna",
                  installments: 3,
                  amount: Math.round((currentPrice / 3) * 100) / 100, // Calculate installment amount
                }}
                isSale={hasDiscount}
                // Add variant information for proper cart/wishlist functionality
                variantId={product.default_variant?.id}
                size={product.default_variant?.size}
                color={product.default_variant?.color}
                stock={product.default_variant?.stock}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopOurBestSeller;
