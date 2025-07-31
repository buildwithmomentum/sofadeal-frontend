"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/button-custom";

const PayInSlicesSection = () => {
  return (
    <section className="w-full py-8 md:py-16">
      <div className="">
        <div className="bg-light-blue relative min-h-[300px] overflow-hidden md:h-[400px] lg:h-[450px]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/footer-img.png"
              alt="Pay in Slices Background"
              fill
              className="object-cover 2xl:object-contain"
              priority
            />
          </div>

          {/* Content Overlay - Centered */}
          <div className="relative z-10 mt-12 flex h-full items-center justify-center md:mt-0">
            <div className="px-6 text-center md:px-12">
              <h1 className="text-4xl lg:text-[85px]">PAY IN SLICES</h1>
              <p className="font-open-sans text-gray mx-auto mb-6 max-w-xl text-sm md:text-base">
                Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing El Mauris
                Accumsan Volutpat Semper. Quisque Hendrerit Justo Quis Euismod
                Pretium.
              </p>

              <div className="flex w-full justify-center px-4 sm:px-0">
                <Button
                  variant="main"
                  size="xl"
                  rounded="full"
                  className="bg-blue relative h-[30px] items-center justify-start sm:h-[57px] sm:w-[174px]"
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
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PayInSlicesSection;
