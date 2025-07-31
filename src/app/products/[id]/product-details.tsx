"use client";

import React, { useState } from "react";
import "@/components/ui/modern-image-gallery.css";
import { useProduct, useRelatedProducts } from "@/hooks/use-products";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { Button } from "@/components/button-custom";
import { MarqueeStrip } from "@/components/marquee-strip";
import { Testimonials } from "@/components/landing-page/testimonials";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Plus, Package, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ViewInRoom from "../components/view-in-room";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductDetailsProps {
  productId: string;
}

interface DimensionItem {
  label: string;
  cm: string | number;
  inches: string | number;
  letter: string;
}

const marqueeItems = [
  { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
  { text: "100-NIGHT TRAIL", icon: "/sofa-icon.png" },
  { text: "EASY RETURN", icon: "/sofa-icon.png" },
  { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
];

const fabricOptions = [
  { id: 1, name: "Fabric 1", image: "/fa-11.svg" },
  { id: 2, name: "Fabric 2", image: "/fa-2.png" },
  { id: 3, name: "Fabric 3", image: "/fa-3.png" },
  { id: 4, name: "Fabric 4", image: "/fa-4.png" },
  { id: 5, name: "Fabric 5", image: "/fa-5.png" },
];

const colorMap: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Gray: "#808080",
  Grey: "#808080",
  Red: "#FF0000",
  Blue: "#0000FF",
  Green: "#008000",
  Brown: "#A52A2A",
  Beige: "#F5F5DC",
  Navy: "#000080",
  Charcoal: "#36454F",
  Emerald: "#50C878",
  Burgundy: "#800020",
  Cream: "#FFFDD0",
};

// Additional colors that could be available in future
const additionalColors = [
  { name: "Teal", code: "#008080" },
  { name: "Purple", code: "#800080" },
  { name: "Orange", code: "#FFA500" },
  { name: "Pink", code: "#FFC0CB" },
  { name: "Maroon", code: "#800000" },
  { name: "Olive", code: "#808000" },
];

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const {
    data: product,
    isLoading,
    error,
  } = useProduct(productId, {
    includeVariants: true,
    includeImages: true,
    includeCategory: true,
  });

  const { data: relatedProducts } = useRelatedProducts(productId, {
    limit: 4,
    includeCategory: true,
  });

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<number>(1);
  // const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showViewInRoom, setShowViewInRoom] = useState(false);
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [selectedTab, setSelectedTab] = useState("images");

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();

  // Initialize selectedVariant with the first available variant when product loads
  React.useEffect(() => {
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      const firstAvailableVariant =
        product.variants.find((v) => v.stock > 0) || product.variants[0];
      setSelectedVariant(firstAvailableVariant.id);
    }
  }, [product, selectedVariant]);

  const selectedVariantData =
    product?.variants?.find((v) => v.id === selectedVariant) ||
    product?.variants?.[0];

  const currentVariantId =
    selectedVariantData?.id || product?.variants?.[0]?.id;

  const currentPrice = selectedVariantData?.price || product?.base_price || 0;
  const currentStock = selectedVariantData?.stock || 0;
  const mainImages = product?.images?.filter((img) => !img.variant_id) || [];
  const variantImages = selectedVariantData?.images || [];
  const displayImages = variantImages.length > 0 ? variantImages : mainImages;

  const isWishlisted = isInWishlist(currentVariantId || "");

  const handleAddToCart = () => {
    if (product && currentVariantId) {
      const productImage =
        displayImages.length > 0 ? displayImages[0].url : undefined;

      const itemToAdd = {
        id: currentVariantId,
        name: `${product.name}${
          selectedVariantData
            ? ` - ${selectedVariantData.color} ${selectedVariantData.size}`
            : ""
        }`,
        price: currentPrice,
        image: productImage,
        variant_id: currentVariantId,
        variant: selectedVariantData
          ? {
              color: selectedVariantData.color,
              size: selectedVariantData.size,
              sku: selectedVariantData.sku,
            }
          : undefined,
      };

      // for (let i = 0; i < quantity; i++) {
      addItem(itemToAdd);
      // }
    }
  };

  const handleWishlistToggle = async () => {
    if (currentVariantId && product) {
      try {
        await toggleItem(currentVariantId, {
          name: product.name,
          price: selectedVariantData?.price || product.base_price,
          image:
            selectedVariantData?.images?.[0]?.url || product.images?.[0]?.url,
          variant_id: currentVariantId,
        });
      } catch (error) {
        console.error("Failed to toggle wishlist item:", error);
      }
    }
  };

  const uniqueColors = [
    ...new Set(product?.variants?.map((v) => v.color).filter(Boolean)),
  ];

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const toggleViewInRoom = () => {
    setShowViewInRoom(!showViewInRoom);
  };

  if (isLoading) {
    return (
      <div className="px-[32px] py-12">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <Image
              src="/favicon.ico"
              alt="Loading"
              width={48}
              height={48}
              className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-pulse"
            />
            <p className="text-lg font-medium">Loading product details...</p>
            <p className="text-muted-foreground text-sm">
              Please wait while we fetch the information
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto px-[32px] py-12">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Product Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The product you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button variant="primary">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabList = [
    { key: "images", label: "Images", section: "style" },
    { key: "style", label: "Style", section: "style" },
    { key: "dimensions", label: "Dimensions", section: "dimensions" },
    { key: "material", label: "Material", section: "material" },
    { key: "recommended", label: "Recommended", section: "recommended" },
    { key: "reviews", label: "Reviews", section: "reviews" },
  ];

  return (
    <div className="w-full overflow-hidden">
      <div className="px-[32px] py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Homepage</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">Our Products</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium">
                {product.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Product Details */}
        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Image Gallery with Fixed Layout */}
          <div className="relative">
            <div className="flex gap-2 md:gap-4">
              {/* Main Image Gallery */}
              <div className="w-full flex-1 md:max-w-[calc(100%-80px)]">
                <div
                  className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-lg bg-gray-100"
                  onClick={toggleZoom}
                >
                  {displayImages.length > 0 ? (
                    <Image
                      src={
                        displayImages[currentImageIndex]?.url ||
                        "/placeholder.svg"
                      }
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      fill
                      className={cn(
                        "bg-white object-contain transition-transform duration-300",
                        isZoomed
                          ? "scale-150 cursor-zoom-out"
                          : "group-hover:scale-105"
                      )}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}

                  {/* Zoom Overlay on Hover */}
                  {!isZoomed && (
                    <div className="bg-opacity-0 group-hover:bg-opacity-10 absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <div className="bg-opacity-50 rounded-full px-3 py-1 text-sm font-medium text-white">
                        Click to zoom
                      </div>
                    </div>
                  )}

                  {/* Zoom Exit Button */}
                  {isZoomed && (
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsZoomed(false);
                        }}
                        className="bg-opacity-50 hover:bg-opacity-70 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Wishlist Button for Small Screens */}
                  <div className="absolute top-4 right-4 z-10 md:hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle();
                      }}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center transition-all",
                        isWishlisted
                          ? ""
                          : "border-white bg-white/90 backdrop-blur-sm"
                      )}
                    >
                      <Image
                        src={isWishlisted ? "/fav-filled.png" : "/fav.png"}
                        alt="Wishlist"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </button>
                  </div>
                </div>

                {/* Thumbnail Row */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {displayImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                        currentImageIndex === index
                          ? "border-blue"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        fill
                        className="bg-white object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fixed Action Buttons Column */}
              <div className="hidden h-[400px] w-12 flex-shrink-0 flex-col items-center justify-between gap-2 md:flex md:h-[500px] md:w-16 md:gap-3 2xl:h-[600px]">
                <div className="space-y-1 md:space-y-2">
                  {/* Other Action Buttons */}
                  <button className="bg-blue flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-medium text-white md:h-12 md:w-12 md:text-[14px]">
                    360
                  </button>
                  <button
                    onClick={toggleViewInRoom}
                    className="bg-blue flex h-10 w-10 items-center justify-center rounded-full text-[6px] font-medium text-white md:h-12 md:w-12 md:text-[8px]"
                  >
                    View in <br />
                    Room
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center md:h-12 md:w-12",
                      isWishlisted ? "border-red-200 bg-red-50" : "bg-white"
                    )}
                  >
                    <Image
                      src={isWishlisted ? "/fav-filled.png" : "/fav.png"}
                      alt="Wishlist"
                      width={40}
                      height={40}
                      className="object-contain md:h-[50px] md:w-[50px]"
                    />
                  </button>
                </div>
                <div>
                  {/* Vertical Carousel Navigation */}
                  {displayImages.length > 1 && (
                    <div className="flex flex-col gap-1 md:gap-2">
                      <button
                        onClick={prevImage}
                        className="group border-dark-gray hover:bg-blue flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all hover:border-white hover:shadow-md md:h-10 md:w-10"
                      >
                        <ChevronLeft className="text-dark-gray h-3 w-3 group-hover:text-white md:h-4 md:w-4" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="group border-dark-gray hover:bg-blue flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all hover:border-white hover:shadow-md md:h-10 md:w-10"
                      >
                        <ChevronRight className="text-dark-gray h-3 w-3 group-hover:text-white md:h-4 md:w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-dark-gray text-[32px] leading-tight uppercase md:text-[48px] lg:text-[56px]">
                {product.name}
              </h1>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="font-bebas flex items-baseline gap-2 md:gap-3">
                  <span className="text-dark-gray text-[28px] md:text-[36px] lg:text-[42px]">
                    $ {currentPrice.toFixed(2)}
                  </span>
                  <span className="text-gray text-[20px] line-through md:text-[24px] lg:text-[30px]">
                    $ {(currentPrice * 1.2).toFixed(2)}
                  </span>
                </div>
                <div>
                  <Badge className="rounded-full bg-[#56748e] px-3 py-1 text-[14px] text-white md:px-6 md:py-2 md:text-[18px] lg:text-[20px]">
                    {product?.delivery_info?.text || "3 To 4 Days Delivery"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div className="space-y-4">
                <span className="text-gray text-base">
                  Color - {selectedVariantData?.color || "Black"}
                </span>
                <div className="mt-2 flex flex-wrap gap-3">
                  {uniqueColors.map((color) => {
                    const isSelected = selectedVariantData?.color === color;
                    const colorCode = colorMap[color] || "#000000";
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          const variant = product.variants?.find(
                            (v) => v.color === color && v.stock > 0
                          );
                          if (variant) setSelectedVariant(variant.id);
                        }}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-all",
                          isSelected
                            ? "ring-blue ring-1 ring-offset-1"
                            : "border-gray-300 hover:border-gray-400"
                        )}
                        style={{ backgroundColor: colorCode }}
                        title={color}
                      />
                    );
                  })}

                  {/* Additional colors when expanded */}
                  {showMoreColors &&
                    additionalColors.map((color) => (
                      <button
                        key={color.name}
                        disabled
                        className="h-8 w-8 rounded-full border-2 border-gray-300 opacity-50 transition-all"
                        style={{ backgroundColor: color.code }}
                        title={`${color.name} (Coming Soon)`}
                      />
                    ))}

                  <button
                    onClick={() => setShowMoreColors(!showMoreColors)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 text-gray-400 transition-all hover:border-gray-400 hover:bg-gray-50"
                    title={
                      showMoreColors ? "Show fewer colors" : "Show more colors"
                    }
                  >
                    <Plus
                      className={cn(
                        "h-4 w-4 transition-transform",
                        showMoreColors && "rotate-45"
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Fabric Selection */}
            <div className="space-y-3">
              <span className="text-gray text-base">Fabric</span>
              <div className="mt-2 flex gap-3">
                {fabricOptions.map((fabric) => (
                  <button
                    key={fabric.id}
                    onClick={() => setSelectedFabric(fabric.id)}
                    className={cn(
                      "h-8 w-8 overflow-hidden rounded-full",
                      selectedFabric === fabric.id
                        ? "border-blue ring-blue ring-1 ring-offset-2"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                  >
                    <Image
                      src={fabric.image}
                      alt={fabric.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Klarna Payment */}
            <div className="mt-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
                  <span className="w-fit rounded-full bg-[#FFA8CD] px-4 py-1 text-sm font-bold text-[#000] md:px-6 md:py-2">
                    Klarna
                  </span>

                  <span className="text-[16px] text-[#999] md:text-[18px] lg:text-[20px]">
                    Make 3 Payments Of $ {(currentPrice / 3).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-[18px] text-[#222222] md:text-[22px] lg:text-[25px]">
                DESCRIPTION:
              </h3>
              <p className="text-sm leading-relaxed text-[#999] md:text-base">
                {product.description}
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  variant="primary"
                  size="xl"
                  rounded="full"
                  className="md:size-xxl relative w-full flex-1 items-center justify-start"
                  icon={
                    <Image
                      src="/arrow-right.png"
                      alt="arrow-right"
                      width={24}
                      height={24}
                      className="text-blue absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#fff] object-contain p-1 md:h-10 md:w-10 md:p-2"
                    />
                  }
                >
                  Shop Now
                </Button>
                <Button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  variant="outline"
                  size="xl"
                  rounded="full"
                  className="group md:size-xxl !border-blue hover:border-dark-gray relative w-full flex-1 items-center justify-start !border-1 hover:bg-transparent"
                  icon={
                    <Image
                      src="/arrow-right1.png"
                      alt="arrow-right"
                      width={24}
                      height={24}
                      className="bg-blue group-hover:bg-dark-gray absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full object-contain p-1 md:h-10 md:w-10 md:p-2"
                    />
                  }
                >
                  Add To Cart
                </Button>
              </div>
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="delivery">
                  <AccordionTrigger className="font-normal">
                    Delivery
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-[#999]">
                      {product?.delivery_info?.text ? (
                        <>
                          {product.delivery_info.text}
                          {product.delivery_info.min_days &&
                            product.delivery_info.max_days && (
                              <span className="mt-1 block">
                                Delivery time: {product.delivery_info.min_days}-
                                {product.delivery_info.max_days} days
                              </span>
                            )}
                        </>
                      ) : (
                        "We offer three delivery options: Basic, Standard, and Premium. Sofas are delivered with our Premium option. 7-day delivery subject to stock and postcode."
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="payment">
                  <AccordionTrigger>Payment</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-[#999]">
                      We accept all major credit/debit cards, Klarna, and
                      PayPal. Pay in 3 with Klarna available at checkout.
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="warranty">
                  <AccordionTrigger>Warranty</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-[#999]">
                      {product?.warranty_info ||
                        "All sofas come with a 10-year frame warranty and 2-year fabric warranty. See our warranty policy for details."}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="availability">
                  <AccordionTrigger>Availability</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-[#999]">
                      Most products are in stock for fast delivery. Stock status
                      is shown above. Contact us for special orders.
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* T&C */}
            <p className="text-gray text-sm">Delivery T&C</p>
          </div>
        </div>

        {/* Marquee Strip */}
        <div className="relative right-1/2 left-1/2 -mr-[50vw] mb-5 -ml-[50vw] w-screen">
          <MarqueeStrip
            items={marqueeItems}
            speed={30}
            backgroundColor="bg-blue"
            textColor="text-white"
            className="py-3 sm:py-4"
          />
        </div>

        {/* Tabs Navigation */}
        <div className="mt-12 mb-12 w-full md:mt-20 md:mb-16">
          <div className="flex items-center justify-center px-4">
            <div className="border-blue scrollbar-hide flex w-full overflow-x-auto rounded-full border px-2 py-1 md:justify-between md:px-4 md:py-2">
              {tabList.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSelectedTab(tab.key);
                    handleScrollToSection(tab.section);
                  }}
                  className={`min-w-fit flex-shrink-0 rounded-full px-2 py-2 text-xs font-medium whitespace-nowrap transition-all md:px-3 md:py-4 md:text-sm ${
                    selectedTab === tab.key
                      ? "bg-blue text-white md:w-[20%]"
                      : "text-blue hover:bg-white"
                  } `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Style Section */}
        <section id="style" className="mb-16 py-8 md:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-[36px] leading-tight md:text-[56px] lg:text-[72px]">
                MALVERN STYLE
              </h1>
              <div className="space-y-3 text-sm text-[#999] md:space-y-4 md:text-base">
                <p>
                  Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed
                  Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.
                  Ut Enim Ad Minim Veniam, Quis Nostrud Exercitation Ullamco
                  Laboris Nisi Ut Aliquip Ex Ea Commodo Consequat. Duis Aute
                  Irure Dolor In Reprehenderit In Voluptate Velit Esse Cillum
                  Dolore Eu Fugiat Nulla Pariatur. Excepteur Sint Occaecat
                  Cupidatat Non Proident, Sunt In Culpa Qui Officia Deserunt
                  Mollit Anim Id Est Laborum.
                </p>
                <p>
                  Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed
                  Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.
                  Ut Enim Ad Minim Veniam, Quis Nostrud Exercitation Ullamco
                  Laboris Nisi Ut Aliquip Ex Ea Commodo
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative h-[300px] w-full max-w-[500px] md:h-[380px] md:max-w-[600px] lg:h-[430px] lg:max-w-[640px]">
                <Image
                  src={displayImages[0]?.url || "/placeholder.svg"}
                  alt="Style showcase"
                  fill
                  className="rounded-4xl border border-[#D5EBFF] bg-white object-contain object-center"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Section */}
        <section className="mb-16 py-6 md:py-10">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-[36px] leading-tight md:text-[56px] lg:text-[72px]">
              DELIVERY
            </h1>
            <p className="text-sm leading-relaxed text-[#999] md:text-base">
              {product?.delivery_info?.text ? (
                <>
                  {product.delivery_info.text}
                  {product.delivery_info.min_days &&
                    product.delivery_info.max_days && (
                      <span className="mt-2 block">
                        Delivery timeframe: {product.delivery_info.min_days} to{" "}
                        {product.delivery_info.max_days} days.
                      </span>
                    )}
                  {product.delivery_info.free_shipping_threshold && (
                    <span className="mt-1 block">
                      Free shipping on orders over £
                      {product.delivery_info.free_shipping_threshold}.
                    </span>
                  )}
                </>
              ) : (
                "We Have Three Delivery Options To Choose From, Including Basic, Standard And Premium, Each Offering Different Features Depending On Your Needs. Due To Their Weight And Size, Our Sofas Are Only Available With Our Premium Delivery Option. You Can Find Our Terms And Conditions Here. Please Note That 7 Day Delivery Is Subject To Stock Availability And Delivery Postcode."
              )}
            </p>
          </div>
        </section>
      </div>

      {/* Dimensions Section */}
      <section
        id="dimensions"
        className="bg-light-blue/50 mb-16 py-16 md:py-20 lg:py-30"
      >
        <div className="px-[32px]">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Side - Title and Description */}
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-[36px] leading-tight md:text-[56px] lg:text-[72px]">
                DIMENSIONS & ASSEMBLY
              </h1>
              <p className="text-gray text-sm leading-relaxed md:text-base">
                {product?.assembly_instructions ||
                  "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua."}
              </p>

              {/* Dimensions Diagram */}
              <div className="mt-6 md:mt-8">
                <div className="relative w-full max-w-[500px] md:max-w-[600px]">
                  <Image
                    src={
                      displayImages[displayImages.length - 1]?.url ||
                      "/dimensions-diagram.png"
                    }
                    alt="Product Dimensions Diagram"
                    width={500}
                    height={350}
                    className="h-auto w-full rounded-4xl border border-[#D5EBFF] bg-white object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Dimensions Table */}
            <div className="mt-8 lg:mt-24">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-2 rounded-t-lg bg-[#ffffff] px-3 py-3 text-xs font-semibold text-[#222222] md:gap-4 md:px-6 md:py-4 md:text-sm">
                <div className="text-center">Dimension</div>
                <div className="text-center"></div>
                <div className="text-center">CM</div>
                <div className="text-center">Inches</div>
              </div>

              {/* Table Rows */}
              <div className="overflow-hidden rounded-b-lg bg-white shadow-sm">
                {(() => {
                  // Use dimensions from API variant if available, otherwise fallback to static data
                  const apiDimensions = selectedVariantData?.dimensions;

                  let dimensions: DimensionItem[] = [];

                  if (apiDimensions) {
                    // Transform API dimensions to table format
                    const dimensionMap = [
                      { key: "width", label: "Width", letter: "A" },
                      { key: "depth", label: "Depth", letter: "B" },
                      { key: "height", label: "Height", letter: "C" },
                      { key: "seat_width", label: "Seat Width", letter: "D" },
                      { key: "seat_depth", label: "Seat Depth", letter: "E" },
                      { key: "seat_height", label: "Seat Height", letter: "F" },
                      { key: "bed_width", label: "Bed Width", letter: "G" },
                      { key: "bed_length", label: "Bed Length", letter: "H" },
                    ];

                    dimensions = dimensionMap
                      .filter(
                        (dim) =>
                          apiDimensions[dim.key as keyof typeof apiDimensions]
                      ) // Only include dimensions that exist in API
                      .map((dim) => {
                        const dimensionData =
                          apiDimensions[dim.key as keyof typeof apiDimensions];
                        return {
                          label: dim.label,
                          cm: dimensionData?.cm || 0,
                          inches: dimensionData?.inches || 0,
                          letter: dim.letter,
                        };
                      });
                  }

                  // Fallback to static data if no API dimensions
                  if (dimensions.length === 0) {
                    dimensions = [
                      {
                        label: "Width",
                        cm: "215",
                        inches: "84.65",
                        letter: "A",
                      },
                      {
                        label: "Depth",
                        cm: "96",
                        inches: "37.80",
                        letter: "B",
                      },
                      {
                        label: "Height",
                        cm: "88",
                        inches: "34.65",
                        letter: "C",
                      },
                      {
                        label: "Seat Width",
                        cm: "180",
                        inches: "70.87",
                        letter: "D",
                      },
                      {
                        label: "Seat Depth",
                        cm: "56",
                        inches: "22.05",
                        letter: "E",
                      },
                      {
                        label: "Seat Height",
                        cm: "52",
                        inches: "20.47",
                        letter: "F",
                      },
                      {
                        label: "Bed Width",
                        cm: "180",
                        inches: "70.87",
                        letter: "G",
                      },
                      {
                        label: "Bed Length",
                        cm: "110",
                        inches: "43.31",
                        letter: "H",
                      },
                    ];
                  }

                  return dimensions.map((item, index) => {
                    // Convert cm to inches if only cm is provided
                    const cmValue =
                      typeof item.cm === "string"
                        ? parseFloat(item.cm)
                        : item.cm;
                    const inchesValue =
                      item.inches || (cmValue / 2.54).toFixed(2);

                    return (
                      <div
                        key={index}
                        className={`grid grid-cols-4 gap-2 px-3 py-3 md:gap-4 md:px-6 md:py-4 ${
                          index % 2 === 0 ? "bg-[#f2f2f2]" : "bg-white"
                        }`}
                      >
                        <div className="flex justify-center">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8396a6] text-xs font-bold text-white md:h-8 md:w-8 md:text-sm">
                            {item.letter || String.fromCharCode(65 + index)}
                          </div>
                        </div>
                        <div className="text-center text-xs font-medium text-gray-700 md:text-sm">
                          {item.label}
                        </div>
                        <div className="text-center text-xs font-medium text-gray-900 md:text-sm">
                          {item.cm}
                        </div>
                        <div className="text-center text-xs font-medium text-gray-900 md:text-sm">
                          {inchesValue}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <div className="px-[32px]">
        <section id="material" className="py-8 md:py-16">
          <div className="">
            <h1 className="mb-3 text-[36px] leading-tight md:mb-4 md:text-[56px] lg:text-[72px]">
              MATERIALS & CARE
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-[#999] md:mb-8 md:text-base">
              {product?.care_instructions ||
                "Upholstered In Fabric With A Soft, Textured Touch. Together With The Coordinating Scatter Cushions, It's Really Cosy And Snuggly. We're Choosy When It Comes To Our Upholstery, Using Only The Highest Quality Fabrics. All Our Fabrics Are Rated For Heavy Domestic Use To Stand Up To The Demands Of Family Life. Our Fabric Sofas Have Flat Weave Fabrics Which Are Hard Wearing And Luxurious To Touch."}
            </p>

            <div className="space-y-6 md:space-y-8">
              <div>
                <h1 className="mb-3 text-[28px] leading-tight !font-normal md:mb-4 md:text-[42px] lg:text-[56px]">
                  MATERIAL COMPOSITION:
                </h1>
                <div className="space-y-1 text-sm text-[#999] md:space-y-2 md:text-base">
                  {selectedVariantData?.material ? (
                    <p>Main Material: {selectedVariantData.material}</p>
                  ) : (
                    <p>Main Material: 81% Polyester, 19% Viscose</p>
                  )}
                  <p>
                    Scatter Cushion Cover: 100% Polyester, 56% Polyester, 40%
                    Viscose, 4% Cotton / 100% Polyester
                  </p>
                  <p>
                    Scatter Cushion Filling: These Fibre-Filled Cushions Give
                    Extra Cosiness. They&apos;re Made To Match The Sofa Range In
                    Style And Colour, Too.
                  </p>
                </div>
              </div>

              <div>
                <h1 className="mb-3 text-[28px] leading-tight !font-normal md:mb-4 md:text-[42px] lg:text-[56px]">
                  MATERIAL CONSTRUCTION:
                </h1>
                <div className="space-y-2 text-sm text-[#999] md:space-y-3 md:text-base">
                  <p>
                    Frame: All Our Sofa And Armchair Frames Feature Solid
                    Hardwood. It Forms Part Of A Strong Frame That&apos;s Made
                    To Last - And Designed Not To Creak. Joints Are Strongly
                    Fixed Using Classic Carpentry Skills, So You Can Enjoy The
                    Support And Comfort Of A Well-Made Sofa.
                  </p>
                  <p>
                    Seat Base: Serpentine Springs Spread The Load Of The Seat
                    Cushions, A Sprung Platform With Plenty Of Springs Mean Our
                    Sofas Have Great Support At The Base. That Means No Sagging
                    - And More Comfort For You.
                  </p>
                  <p>
                    Seat Cushion: Sink Into The Comfort Of Our Foam-Filled,
                    Fibre-Topped Seat Cushions. Their Plump-Free Design Means
                    They Require Minimal Attention To Stay Looking Their Best.
                  </p>
                  <p>
                    Back Support: Tensioned Webbing Keeps The Back Cushions In
                    Place. When You Relax Back At The End Of The Day, You Want
                    Just The Right Kind Of Secure Feeling That This Gives.
                  </p>
                  <p>
                    Back Cushion: These Are Fibre-Filled And Designed To Keep
                    Their Shape. Fibre Is So Luxurious When You Want To Settle
                    Back And Relax.
                  </p>
                  <p>Feet: Black Glides</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Related Products */}
      <section id="recommended" className="bg-light-blue mb-16 py-10 md:py-16">
        <div className="px-[32px] py-20">
          <div className="mb-8 flex justify-between md:mb-10">
            <h1>RELATED PRODUCTS</h1>
            <Link href="/products">
              <Button
                variant="primary"
                size="xl"
                rounded="full"
                className="relative w-[160px] items-center justify-start"
                icon={
                  <Image
                    src="/arrow-right.png"
                    alt="arrow-right"
                    width={20}
                    height={20}
                    className="text-blue absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2"
                  />
                }
              >
                View All
              </Button>
            </Link>
          </div>

          {relatedProducts && relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {relatedProducts.slice(0, 3).map((relatedProduct, index) => {
                // Get the variant price or use base price as fallback
                const firstVariant = relatedProduct.variants?.[0];
                const currentPrice =
                  firstVariant?.price || relatedProduct.base_price;
                const hasDiscount = currentPrice < relatedProduct.base_price;

                // Get main image URL with validation
                const getValidImageUrl = (imageUrl?: string) => {
                  try {
                    if (imageUrl && typeof imageUrl === "string") {
                      // Check if it's a valid URL or relative path
                      if (
                        imageUrl.startsWith("http") ||
                        imageUrl.startsWith("/")
                      ) {
                        return imageUrl;
                      }
                    }
                    return "/hero-img.png"; // Fallback to hero image
                  } catch (error) {
                    console.warn("Error processing product image:", error);
                    return "/hero-img.png";
                  }
                };

                const productImage = getValidImageUrl(
                  relatedProduct.images?.[0]?.url
                );

                // Calculate discount percentage if there's a discount
                let discountPercentage = "";
                if (hasDiscount) {
                  const percentage = Math.round(
                    ((relatedProduct.base_price - currentPrice) /
                      relatedProduct.base_price) *
                      100
                  );
                  discountPercentage = `${percentage}% off`;
                }

                return (
                  <ProductCard
                    variant={index % 2 === 0 ? "layout1" : "layout2"} // Alternating layouts
                    key={relatedProduct.id}
                    id={relatedProduct.id}
                    name={relatedProduct.name || "SUNSET TURKISH SOFA"} // Fallback name
                    price={currentPrice}
                    originalPrice={
                      hasDiscount
                        ? relatedProduct.base_price
                        : Math.round(currentPrice * 1.25)
                    } // Always provide original price
                    imageSrc={productImage}
                    rating={4.9} // Static rating since API might not have it
                    discount={discountPercentage || "15% off"} // Use calculated or static discount
                    deliveryInfo={
                      product?.delivery_info?.text || "3 To 4 Days Delivery"
                    }
                    paymentOption={
                      selectedVariantData?.payment_options?.[0]
                        ? {
                            service:
                              selectedVariantData.payment_options[0].provider ||
                              "Klarna",
                            installments:
                              selectedVariantData.payment_options[0]
                                .installments || 3,
                            amount:
                              selectedVariantData.payment_options[0].amount ||
                              Math.round((currentPrice / 3) * 100) / 100,
                          }
                        : {
                            service: "Klarna",
                            installments: 3,
                            amount: Math.round((currentPrice / 3) * 100) / 100,
                          }
                    }
                    isSale={hasDiscount}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="font-open-sans text-gray-600">
                No related products available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="reviews" className="mb-16">
        <Testimonials showBackground={false} />
      </section>

      {/* View in Room Modal */}
      <ViewInRoom
        isOpen={showViewInRoom}
        onClose={() => setShowViewInRoom(false)}
        productImage={
          displayImages[currentImageIndex]?.url || "/placeholder.svg"
        }
        productName={product.name}
        currentImageIndex={currentImageIndex}
        images={displayImages.map((img, index) => ({
          url: img.url,
          alt: `${product.name} - View ${index + 1}`,
        }))}
        onImageChange={setCurrentImageIndex}
      />
    </div>
  );
}
