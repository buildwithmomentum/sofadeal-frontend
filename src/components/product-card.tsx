"use client";

import React, { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/store/cart-store";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { toast } from "sonner";

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  imageSrc?: string;
  rating?: number;
  ratingCount?: number;
  discount?: string;
  isNew?: boolean;
  isSale?: boolean;
  deliveryInfo?: string;
  paymentOption?: {
    service: string;
    installments: number;
    amount: number;
  };
  variant?: "layout1" | "layout2";
  className?: string;
  // Add variant information for proper cart/wishlist functionality
  variantId?: string;
  size?: string;
  color?: string;
  stock?: number;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  imageSrc = "/placeholder.svg",
  rating = 4.9,
  discount,
  deliveryInfo,
  paymentOption,
  variant = "layout1",
  className = "",
  variantId,
  size,
  color,
  stock,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Use variantId if provided, otherwise fall back to id
    const effectiveVariantId = variantId || id.toString();

    setIsAddingToCart(true);
    try {
      await addItem({
        id: effectiveVariantId,
        name,
        price,
        image: imageSrc,
        variant_id: effectiveVariantId,
        size,
        color,
        stock,
      });

      toast.success(`${name} added to cart!`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (amount: number) => {
    return `$ ${amount.toFixed(2)}`;
  };

  // Layout 1: Klarna first, then Price + Delivery
  const Layout1Content = () => (
    <>
      {/* Payment Option - First */}
      {paymentOption && (
        <div className="flex items-center gap-5">
          <span
            className="inline-block rounded-[48.28px] px-7 py-2.5 text-[14px] font-bold"
            style={{ backgroundColor: "#FFA8CD", color: "var(--dark-gray)" }}
          >
            {paymentOption.service}
          </span>
          <div>
            <span className="text-gray text-[20px]">
              Make {paymentOption.installments} Payments Of <br />
              {formatPrice(paymentOption.amount)}
            </span>
          </div>
        </div>
      )}

      {/* Pricing and Delivery Row - Second */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[20px] text-[#999999]">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        {deliveryInfo && (
          <span className="inline-block rounded-xl bg-[#56748e] px-4 py-2 text-xs font-medium text-white">
            {deliveryInfo}
          </span>
        )}
      </div>
    </>
  );

  // Layout 2: Price + Delivery first, then Klarna
  const Layout2Content = () => (
    <>
      {/* Pricing and Delivery Row - First */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[20px] text-[#999999]">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        {deliveryInfo && (
          <span className="inline-block rounded-xl bg-[#56748e] px-4 py-2 text-xs font-medium text-white">
            {deliveryInfo}
          </span>
        )}
      </div>

      {/* Payment Option - Second */}
      {paymentOption && (
        <div className="flex items-center gap-5">
          <span
            className="inline-block rounded-[48.28px] px-7 py-2.5 text-[14px] font-bold"
            style={{ backgroundColor: "#FFA8CD", color: "#222222" }}
          >
            {paymentOption.service}
          </span>
          <div>
            <span className="text-[20px] text-[#999999]">
              Make {paymentOption.installments} Payments Of <br />
              {formatPrice(paymentOption.amount)}
            </span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className={`overflow-hidden bg-transparent ${className}`}>
      <Link href={`/products/${id}`} className="block">
        {/* Product Image */}
        <div
          className={`group relative mb-4 ${className.includes("list-detailed-view") || className.includes("grid-view") ? "h-[700px]" : "h-[300px]"} w-auto overflow-hidden rounded-lg border border-gray-100 bg-white`}
        >
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />

          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-3 left-3">
              <span className="bg-blue rounded px-2 py-1 text-xs font-medium text-white">
                {discount}
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-3 right-0">
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <WishlistButton
                variant_id={variantId || id.toString()}
                product={{
                  name,
                  price,
                  image: imageSrc,
                  size,
                  color,
                  stock,
                }}
                size="lg"
                variant="ghost"
                className="!hover:none bg-none"
              />
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-3">
        {/* Product Name and Rating Row */}
        <div className="flex items-center justify-between">
          <Link href={`/products/${id}`}>
            <h3 className="font-bebas text-dark-gray hover:text-blue text-xl uppercase transition-colors md:text-[34px]">
              {name}
            </h3>
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">{rating}</span>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>

        {/* Render layout based on variant */}
        {variant === "layout1" ? <Layout1Content /> : <Layout2Content />}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="group border-blue text-blue font-open-sans hover:text-dark-gray flex h-[50px] w-full items-center justify-between rounded-full border px-2 pl-4 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{isAddingToCart ? "Adding..." : "Add To Cart"}</span>
          <div className="bg-blue group-hover:text-blue group-hover:bg-dark-gray flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors">
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image
                src="/farrow-r.png"
                alt="Arrow Right"
                width={35}
                height={35}
                className="h-[35px] w-[35px]"
              />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
