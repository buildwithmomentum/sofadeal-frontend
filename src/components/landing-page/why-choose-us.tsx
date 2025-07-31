"use client";

import React from "react";

const WhyChooseUs = () => {
  const features = [
    {
      id: "f1",
      title: "Free Delivery & Free Assembly",
      description:
        "Enjoy Hassle-Free Shopping, Complimentary Delivery And Expert Assembly At Your Doorstep No Hidden Charges.",
    },
    {
      id: "f2",
      title: "In Stock 1 To 7 Days Delivery",
      description:
        "Quick Delivery On In Stock Items. Get Your Order Within A Week And Start Enjoying It Sooner.",
    },
    {
      id: "f3",
      title: "Pre Order 5 Weeks Delivery",
      description:
        "Pre-Order Now And Receive Your Custom Piece Within 5 Weeks — Made To Order, Just For You.",
    },
    {
      id: "f4",
      title: "Free Returns On Delivery",
      description:
        "Not Satisfied? Return The Product At The Time Of Delivery — Completely Free And Risk-Free.",
    },
    {
      id: "f5",
      title: "Full Refund Guaranteed",
      description:
        "Shop With Confidence. If You're Not Happy, We'll Give You A Full Refund — No Questions Asked.",
    },
  ];

  return (
    <div className="py-12 md:py-16 lg:py-20">
      <div className="px-[32px]">
        <div className="mb-8 text-center md:mb-12">
          <h1 className="text-4xl lg:text-[85px]">WHY SOFA DEALS</h1>
        </div>

        {/* First Row - 3 columns with white cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:mb-12 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {features.slice(0, 3).map((feature) => (
            <div
              key={feature.id}
              className="rounded-lg bg-white p-6 text-center md:p-4"
            >
              <h3 className="font-bebas text-dark-gray mb-3 text-lg uppercase md:mb-4 md:text-xl lg:text-[34px] lg:leading-[40px]">
                {feature.title}
              </h3>
              <p className="font-open-sans text-gray text-sm leading-relaxed md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Second Row - 2 columns centered with white cards */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {features.slice(3, 5).map((feature) => (
            <div
              key={feature.id}
              className="rounded-lg bg-white p-6 text-center md:p-4"
            >
              <h3 className="font-bebas text-dark-gray mb-3 text-lg uppercase md:mb-4 md:text-xl lg:text-[34px] lg:leading-[40px]">
                {feature.title}
              </h3>
              <p className="font-open-sans text-gray text-sm leading-relaxed md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
