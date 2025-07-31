"use client";

import React, { useState } from "react";
import Image from "next/image";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFeaturedCategories } from "@/hooks/use-categories";

// Reusable Feature Card Component
interface FeatureCardProps {
  title: string;
  image: string;
  href: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, image, href }) => {
  return (
    <div className="relative w-full">
      {/* Image container */}
      <div className="overflow-hidden rounded-2xl">
        <div className="relative h-[300px] w-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={400}
            height={300}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>

      {/* Action button outside image with proper spacing */}
      <div className="mt-4 flex items-center justify-between px-2">
        <h3 className="font-bebas text-dark-gray flex-1 pr-4 text-[38px] uppercase md:leading-[40px]">
          {title}
        </h3>
        <Link
          href={href}
          className="inline-flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full text-white md:h-20 md:w-20"
        >
          <Image
            src="/farrow-r.png"
            alt="Arrow Right"
            width={40}
            height={40}
            className="h-10 w-10"
          />
        </Link>
      </div>
    </div>
  );
};

// Main Featured Categories Component
const FeaturedCategories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch featured categories from API
  const {
    data: apiCategories,
    isLoading,
    error,
  } = useFeaturedCategories({ limit: 6 });

  // Transform API data to match component interface
  const categories = React.useMemo(() => {
    if (!apiCategories || apiCategories.length === 0) {
      // Fallback to static data if API fails or returns no data
      return [
        {
          id: "1",
          title: "Living Collections",
          image: "/f-1.png",
          href: "/products?category=living",
        },
        {
          id: "2",
          title: "Dining Collections",
          image: "/f-2.png",
          href: "/products?category=dining",
        },
        {
          id: "3",
          title: "Outdoor Collections",
          image: "/f-3.png",
          href: "/products?category=outdoor",
        },
      ];
    }

    // Transform API categories to component format
    const transformedCategories = apiCategories.map((category) => ({
      id: category.id,
      title: category.name,
      image: category.image_url || "/f-1.png", // Fallback image
      href: `/products?categoryId=${category.id}`,
    }));

    // Return the transformed categories without duplication
    // The carousel will handle cycling through them
    return transformedCategories;
  }, [apiCategories]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="py-12 md:py-16 lg:py-20">
        <div className="px-[32px]">
          <div className="mb-8 flex items-center justify-between sm:flex-col md:mb-12 md:flex-row">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl lg:text-[85px]">
                SHOP OUR FEATURED CATEGORIES
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-gray-200"></div>
                <div className="mt-4 flex items-center justify-between px-2">
                  <div className="h-6 w-32 rounded bg-gray-200"></div>
                  <div className="h-10 w-10 rounded-full bg-gray-200 md:h-12 md:w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Log error but don't show error state (fallback to static data)
  if (error) {
    console.warn("Failed to load featured categories:", error);
  }

  const nextSlide = () => {
    if (categories.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % categories.length);
    }
  };

  const prevSlide = () => {
    if (categories.length > 0) {
      setCurrentIndex(
        (prev) => (prev - 1 + categories.length) % categories.length
      );
    }
  };

  const getVisibleCards = () => {
    if (categories.length === 0) return [];

    const cards = [];
    const visibleCount = Math.min(3, categories.length);

    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % categories.length;
      cards.push(categories[index]);
    }
    return cards;
  };

  return (
    <div className="py-12 md:py-16 lg:py-20">
      <div className="px-[32px]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between sm:flex-col md:mb-12 md:flex-row">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl lg:text-[85px]">
              SHOP OUR FEATURED CATEGORIES
            </h1>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-4">
            <Button
              onClick={prevSlide}
              className="border-blue text-blue flex h-[50px] w-[50px] items-center justify-center rounded-full border-1 bg-transparent p-0 sm:h-[57px] sm:w-[57px]"
            >
              <Image
                src="/arrow-left.png"
                alt="Previous"
                width={24}
                height={24}
                className="h-8 w-8 object-contain"
              />
            </Button>
            <Button
              onClick={nextSlide}
              className="bg-blue flex h-[50px] w-[50px] items-center justify-center rounded-full p-0 text-white sm:h-[57px] sm:w-[57px]"
            >
              <Image
                src="/arrow-right1.png"
                alt="Next"
                width={24}
                height={24}
                className="h-8 w-8 object-contain"
              />
            </Button>
          </div>
        </div>

        {/* Cards Container */}
        <div className="relative overflow-hidden">
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 ">
            {getVisibleCards().map((category, index) => (
              <FeatureCard
                key={`${category.id}-${currentIndex}-${index}`}
                title={category.title}
                image={category.image}
                href={category.href}
              />
            ))}
          </div>
        </div>

        {/* Mobile Dots Indicator */}
        <div className="mt-8 flex justify-center gap-2 md:hidden">
          {categories.slice(0, 3).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex % 3 ? "bg-blue w-6" : "bg-gray"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCategories;
