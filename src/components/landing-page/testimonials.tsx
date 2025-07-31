"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Testimonial {
  id: number;
  timeAgo: string;
  rating: number;
  title: string;
  description: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    timeAgo: "2 days ago",
    rating: 5,
    title: "BEST ON THE MARKET",
    description:
      "Lorem Ipsum Dolor Sit Amet, Cons Adipiscing Elit, Sed Do Eiusmod Tem Incididunt Ut Libore Et Dolore Magna Aliqua. Ut Enim Ad Veniam.",
    author: "EMILY R.",
    role: "CERTIFIED TRAINER",
  },
  {
    id: 2,
    timeAgo: "2 days ago",
    rating: 5,
    title: "BEST ON THE MARKET",
    description:
      "Lorem Ipsum Dolor Sit Amet, Cons Adipiscing Elit, Sed Do Eiusmod Tem Incididunt Ut Libore Et Dolore Magna Aliqua. Ut Enim Ad Veniam.",
    author: "EMILY R.",
    role: "CERTIFIED TRAINER",
  },
  {
    id: 3,
    timeAgo: "2 days ago",
    rating: 5,
    title: "BEST ON THE MARKET",
    description:
      "Lorem Ipsum Dolor Sit Amet, Cons Adipiscing Elit, Sed Do Eiusmod Tem Incididunt Ut Libore Et Dolore Magna Aliqua. Ut Enim Ad Veniam.",
    author: "EMILY R.",
    role: "CERTIFIED TRAINER",
  },
  {
    id: 4,
    timeAgo: "3 days ago",
    rating: 5,
    title: "EXCEPTIONAL QUALITY",
    description:
      "Amazing furniture quality and customer service. The delivery was prompt and the assembly team was professional. Highly recommended!",
    author: "MICHAEL S.",
    role: "VERIFIED BUYER",
  },
  {
    id: 5,
    timeAgo: "1 week ago",
    rating: 5,
    title: "OUTSTANDING SERVICE",
    description:
      "From browsing to delivery, everything was perfect. The sofa exceeded my expectations and the whole process was seamless.",
    author: "SARAH L.",
    role: "SATISFIED CUSTOMER",
  },
  {
    id: 6,
    timeAgo: "1 week ago",
    rating: 5,
    title: "EXCELLENT VALUE",
    description:
      "The sofa exceeded my expectations and the whole process was seamless.",
    author: "SARAH L.",
    role: "SATISFIED CUSTOMER",
  },
];

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({
  testimonial,
}) => {
  return (
    <Card className="h-full rounded-lg border-0 bg-[#ffffff] shadow-lg md:w-[400px] 2xl:w-[500px]">
      <CardContent className="flex h-full flex-col p-6">
        {/* Header with stars and timestamp */}
        <div className="mb-4 flex items-start justify-between">
          {/* Star rating */}
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) =>
              index < testimonial.rating ? (
                <Image
                  key={index}
                  src="/star.png"
                  alt="Filled star"
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                />
              ) : (
                <Star key={index} className="h-4 w-4 text-gray-300" />
              )
            )}
          </div>

          {/* Time stamp */}
          <div className="font-open-sans text-sm text-[#202020]">
            {testimonial.timeAgo}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-open-sans mb-4 text-lg font-bold text-black uppercase">
          {testimonial.title}
        </h3>

        {/* Description */}
        <p className="font-open-sans mb-6 flex-grow text-sm leading-relaxed text-gray-500">
          {testimonial.description}
        </p>

        {/* Author */}
        <div className="mt-auto">
          <p className="font-open-sans text-sm font-bold text-black uppercase">
            -{testimonial.author}, {testimonial.role}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

interface TestimonialsProps {
  showBackground?: boolean;
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  showBackground = true,
}) => {
  const [api, setApi] = useState<CarouselApi>();

  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className={`py-24 ${showBackground ? "bg-light-blue" : ""}`}>
        <div className="px-[32px]">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between sm:flex-col md:mb-12 md:flex-row">
            <div className="md:mb-0">
              <h1 className="text-4xl lg:text-[85px]">WHAT OUR BUYERS SAYS</h1>
            </div>

            {/* Navigation buttons in header */}
            <div className="flex items-center gap-4">
              <Button
                onClick={scrollPrev}
                className="border-blue text-blue hover:bg-blue flex h-[50px] w-[50px] items-center justify-center rounded-full border-1 bg-transparent p-0 transition-all duration-300 hover:text-white sm:h-16 sm:w-16"
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
                onClick={scrollNext}
                className="bg-blue hover:bg-blue/90 flex h-[50px] w-[50px] items-center justify-center rounded-full p-0 text-white transition-all duration-300 sm:h-16 sm:w-16"
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
        </div>

        {/* Carousel with overflow on both sides and blur effects */}
        <div className="relative">
          {/* Left fade overlay - covers partial left card */}
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-[200px] bg-gradient-to-r from-[#faf9f6] via-[#faf9f6]/60 to-transparent"></div>

          {/* Right fade overlay - covers partial right card */}
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-[200px] bg-gradient-to-l from-[#faf9f6] via-[#faf9f6]/60 to-transparent"></div>

          <div className="overflow-hidden">
            <Carousel
              setApi={setApi}
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full"
            >
              <div className="">
                <CarouselContent className="-ml-2 md:-ml-98">
                  {testimonials.map((testimonial) => (
                    <CarouselItem
                      key={testimonial.id}
                      className="basis-[85%] pl-2 sm:basis-[45%] md:pl-4 lg:basis-[420px] 2xl:basis-[530px]"
                    >
                      <TestimonialCard testimonial={testimonial} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
