"use client";

import { MarqueeStrip } from "@/components/marquee-strip";
import { Button } from "@/components/button-custom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import Image from "next/image";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  // Marquee items data
  const marqueeItems = [
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
    { text: "100-NIGHT TRIAL", icon: "/sofa-icon.png" },
    { text: "EASY RETURN", icon: "/sofa-icon.png" },
    { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

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
              alt="Sofa Deals Contact Us"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="absolute left-4 flex-col justify-center px-[32px] py-8 sm:py-12 md:bottom-[4px] md:mt-[-60px] md:py-16 lg:py-26 2xl:bottom-[-50px] 2xl:mt-[0px]">
            <div className="max-w-full sm:max-w-md lg:max-w-xl 2xl:max-w-2xl">
              <h1 className="sm:text-[85px]">CONTACT US</h1>
              <p className="font-open-sans mb-8 text-sm leading-relaxed text-[#999] sm:text-base">
                Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing El Mauris
                Accumsan Volutpat Semper. Quisque Hendrerit Justo Quis Euismod
                Pretium.
              </p>
              <Button
                variant="main"
                size="xl"
                rounded="full"
                className="bg-blue relative w-[170px] items-center justify-start sm:!w-[200px]"
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
                Custom Order
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

      {/* Contact Section */}
      <div className="mt-12 py-8 md:py-16">
        <div className="relative px-[32px]">
          <div className="bg-light-blue rounded-3xl p-4 shadow-lg sm:p-6 md:p-8 lg:ml-[150px] lg:p-12 2xl:w-[90%]">
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
              {/* Contact Information */}
              <div className="w-full lg:ml-[-200px] lg:w-2/5">
                <div className="bg-blue mx-auto flex h-full w-full flex-col items-center justify-center gap-4 rounded-3xl p-4 text-white sm:gap-6 sm:p-6 lg:gap-8 lg:p-8">
                  <div>
                    <h2 className="font-bebas mb-4 text-3xl font-medium text-white sm:mb-6 sm:text-4xl lg:mb-8 lg:text-[52px]">
                      Contact Us
                    </h2>

                    {/* Phone */}
                    <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4 lg:mb-8">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-15 sm:w-15">
                        <Image
                          src="/c-1.png"
                          alt="Phone"
                          width={24}
                          height={24}
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        />
                      </div>
                      <span className="text-sm sm:text-base">
                        +1 (800) 123-4567
                      </span>
                    </div>

                    {/* Email */}
                    <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4 lg:mb-8">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-15 sm:w-15">
                        <Image
                          src="/c-2.png"
                          alt="Email"
                          width={24}
                          height={24}
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        />
                      </div>
                      <span className="text-sm break-all sm:text-base">
                        Info@Sofa Deals.Com
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-15 sm:w-15">
                        <Image
                          src="/c-3.png"
                          alt="Location"
                          width={24}
                          height={24}
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base lg:text-base">
                          123 Fleet Lane, Truckville,
                        </div>
                        <div className="text-sm sm:text-base lg:text-base">
                          TX, USA
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="flex-1">
                <div className="mb-6 lg:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-[52px]">
                    LET&apos;S CONNECT!
                  </h1>
                  <p className="mt-2 text-sm text-[#999] sm:text-base">
                    Need more details or want to book our services? Reach out to
                    us today
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="h-[65px] rounded-full border-white bg-white px-6 text-[18px] placeholder:text-[#999]"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="h-[65px] rounded-full border-white bg-white px-6 text-[18px] placeholder:text-[#999]"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-[65px] rounded-full border-white bg-white px-6 text-[18px] placeholder:text-[#999]"
                      required
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <Textarea
                      name="message"
                      placeholder="Message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="min-h-[218px] resize-none rounded-2xl border-white bg-white px-6 py-4 text-[18px] placeholder:text-[#999]"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      variant="main"
                      size="xl"
                      rounded="full"
                      className="bg-blue relative !w-[146px] items-center justify-start"
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
                      Submit
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
