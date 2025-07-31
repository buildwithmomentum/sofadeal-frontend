"use client";

import { useCart } from "@/lib/store/cart-store";
import { useAuth } from "@/lib/providers/auth-provider";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import SafeImage from "@/components/ui/safe-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/button-custom";
import { PaymentApiService, CreatePaymentRequest } from "@/lib/api/payment";
import {
  redirectToPayment,
  getPaymentErrorMessage,
  logPaymentAttempt,
  storeOrderId,
  convertCartItemsToPaymentFormat,
  getCountryName,
  formatPhoneNumber,
} from "@/lib/utils/payment-utils";

// Define types for better TypeScript support
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant_id: string;
  size?: string;
  color?: string;
  availableColors?: string[];
  stock?: number;
}

interface PaymentError {
  status?: number;
  details?: Array<{
    field: string;
    message: string;
  }>;
  stock_issues?: Array<{
    variant_id: string;
    available: number;
    requested: number;
  }>;
}

interface ShippingOption {
  method: "free" | "express" | "pickup";
  cost: number;
  label: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zipCode: string;
  differentBilling: boolean;
  paymentMethod: "card" | "paypal";
  cardNumber: string;
  expiry: string;
  cvc: string;
}

interface OrderData {
  orderCode: string;
  date: string;
  total: string;
  paymentMethod: string;
  items: CartItem[];
}

// Available colors for products
const AVAILABLE_COLORS = [
  { name: "Black", value: "black", hex: "#000000" },
  { name: "Gray", value: "gray", hex: "#666666" },
  { name: "Brown", value: "brown", hex: "#8B4513" },
  { name: "Navy", value: "navy", hex: "#000080" },
];

// Shipping options
const SHIPPING_OPTIONS: ShippingOption[] = [
  { method: "free", cost: 0, label: "Free shipping" },
  { method: "express", cost: 0, label: "Express shipping" },
  { method: "pickup", cost: 0, label: "Pick Up" },
];

// Color Selection Component
const ColorSelection = ({
  availableColors,
  selectedColor,
  onColorChange,
}: {
  availableColors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      {availableColors.map((colorValue) => {
        const colorConfig = AVAILABLE_COLORS.find(
          (c) => c.value === colorValue
        );
        if (!colorConfig) return null;

        return (
          <button
            key={colorValue}
            onClick={() => onColorChange(colorValue)}
            className={`h-6 w-6 rounded-full border-2 transition-all duration-200 ${
              selectedColor === colorValue
                ? "border-blue scale-110 shadow-lg"
                : "border-gray-300 hover:border-gray-400"
            }`}
            style={{ backgroundColor: colorConfig.hex }}
            title={colorConfig.name}
          />
        );
      })}
    </div>
  );
};

// Cart Steps Component
const CartSteps = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    {
      number: 1,
      title: "Shopping cart",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      ),
    },
    {
      number: 2,
      title: "Checkout details",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      number: 3,
      title: "Order complete",
      icon: (
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-6 flex w-full items-start justify-center gap-4 sm:mb-8 sm:gap-20 lg:gap-40">
      {steps.map((step) => (
        <div key={step.number}>
          <div className="relative flex flex-col">
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ease-in-out sm:h-10 sm:w-10 sm:text-lg ${
                  currentStep >= step.number
                    ? "bg-blue text-white shadow-lg"
                    : "bg-[#999999] text-sm text-white"
                }`}
              >
                {/* Show icon on small screens, number on larger screens */}
                <span className="block sm:hidden">
                  {currentStep > step.number ? (
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </span>
                <span className="hidden sm:block">{step.number}</span>
              </div>
              <span
                className={`ml-2 text-xs whitespace-nowrap transition-colors duration-300 ease-in-out sm:ml-3 sm:text-sm ${
                  currentStep >= step.number
                    ? "text-blue font-medium"
                    : "text-[#999]"
                }`}
              >
                {/* Hide title on small screens, show on larger screens */}
                <span className="hidden text-[18px] sm:inline">
                  {step.title}
                </span>
              </span>
            </div>
            {currentStep >= step.number && (
              <div className="bg-blue absolute top-full mt-2 hidden h-0.5 w-20 rounded-full opacity-100 transition-opacity duration-300 sm:mt-3 sm:block sm:w-40 lg:w-60"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Shopping Cart Tab Component
const ShoppingCartTab = ({ onNext }: { onNext: () => void }) => {
  const {
    items,
    totalPrice,
    shippingInfo,
    discount,
    couponCode,
    updateQuantity,
    removeItem,
    updateItemColor,
    setShippingInfo,
    setCouponCode,
    setDiscount,
    getCartTotal,
    isLoading: cartLoading,
    isAuthenticated,
    isItemLoading,
  } = useCart();

  const [localCouponCode, setLocalCouponCode] = useState(couponCode);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleColorChange = (id: string, color: string) => {
    updateItemColor(id, color);
  };

  const handleShippingChange = (option: ShippingOption) => {
    setShippingInfo(option);
  };

  const applyDiscount = () => {
    if (localCouponCode.toLowerCase() === "save10") {
      setDiscount(totalPrice * 0.1);
      setCouponCode(localCouponCode);
      toast.success("Coupon applied successfully!");
    } else if (localCouponCode.toLowerCase() === "jenkatemw") {
      setDiscount(25);
      setCouponCode(localCouponCode);
      toast.success("Coupon applied successfully!");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const subtotal = totalPrice;
  const total = getCartTotal();

  return (
    <div className="mx-auto px-[32px]">
      {/* Loading indicator for cart operations */}
      {cartLoading && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-blue-700">
              {isAuthenticated
                ? "Syncing cart with server..."
                : "Updating cart..."}
            </span>
          </div>
        </div>
      )}

      <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
        {/* Products List */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg text-[#222]">Product</span>
              <div className="hidden gap-[60px] text-lg text-[#222] sm:flex">
                <span>Quantity</span>
                <span>Colour</span>
                <span>Price</span>
              </div>
            </div>
            <hr className="mt-6 border-[#222]" />
          </div>

          {items.length === 0 && !cartLoading ? (
            <div className="py-8 text-center text-gray-500">
              <p>No items in your cart</p>
              {isAuthenticated && (
                <p className="mt-2 text-sm">
                  Items from your account are automatically loaded
                </p>
              )}
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 border-b border-gray-100 py-4 sm:flex-nowrap"
              >
                <div className="h-20 w-20 flex-shrink-0 rounded bg-white md:h-36 md:w-36">
                  <SafeImage
                    src={
                      item.image ||
                      "https://placehold.co/80x80/e0e0e0/000000?text=No+Image"
                    }
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-full w-full rounded object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 uppercase md:text-[27px]">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 capitalize">
                    Color: {item.color || "Black"}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded bg-[#56748e] px-2 py-1 text-xs text-white">
                    3 To 4 Days Delivery
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={isItemLoading(item.id)}
                    className="mt-2 flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isItemLoading(item.id) ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                    {isItemLoading(item.id) ? "Removing..." : "Remove"}
                  </button>
                </div>

                <div className="mt-4 flex w-full items-center justify-between gap-8 sm:mt-0 sm:w-auto sm:justify-start">
                  {/* Quantity Controls */}
                  <div className="flex items-center overflow-hidden rounded-full border border-gray-300">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center transition-colors duration-200 hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center transition-colors duration-200 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Color Selection */}
                  <ColorSelection
                    availableColors={item.availableColors || ["black", "gray"]}
                    selectedColor={item.color || "black"}
                    onColorChange={(color) => handleColorChange(item.id, color)}
                  />

                  {/* Price */}
                  <div className="min-w-[80px] text-right">
                    <span className="text-lg font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Coupon Section */}
          <div className="mt-8 w-full md:w-[500px]">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="mb-2 text-3xl">Have a coupon?</h3>
                <p className="mb-4 text-base text-[#999999]">
                  Add your code for an instant cart discount
                </p>
                <div className="flex items-center overflow-hidden rounded-full border border-[#999999]">
                  <div className="flex items-center justify-center px-3 py-2">
                    <Image src="/t-1.png" alt="Coupon" width={20} height={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={localCouponCode}
                    onChange={(e) => setLocalCouponCode(e.target.value)}
                    className="flex-1 px-0 py-3 text-sm focus:outline-none"
                  />
                  <button
                    onClick={applyDiscount}
                    className="bg-blue hover:bg-blue/80 mr-2 flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-white"
                  >
                    <Image
                      src="/arrow-right1.png"
                      alt="Apply"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-light-blue rounded-lg p-6 shadow-lg">
            <h3 className="mb-6 text-xl text-gray-800 uppercase md:text-[34px]">
              Cart Summary
            </h3>

            {/* Shipping Options */}
            <div className="mb-6 space-y-4">
              {SHIPPING_OPTIONS.map((option) => (
                <div
                  key={option.method}
                  className={`flex cursor-pointer items-center gap-3 rounded-3xl p-4 transition-colors duration-200 ${
                    shippingInfo.method === option.method
                      ? "border-2 border-black"
                      : "hover:border-1 hover:border-black"
                  }`}
                  onClick={() => handleShippingChange(option)}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      shippingInfo.method === option.method
                        ? "border-black"
                        : "border-gray-400"
                    }`}
                  >
                    {shippingInfo.method === option.method && (
                      <div className="h-2 w-2 rounded-full bg-black"></div>
                    )}
                  </div>
                  <span className="flex-1 text-base text-gray-700">
                    {option.label}
                  </span>
                  {option.cost > 0 && (
                    <span className="text-sm font-medium text-gray-700">
                      ${option.cost.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Price Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-base text-gray-700">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {shippingInfo.cost > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Shipping</span>
                  <span className="font-medium">
                    ${shippingInfo.cost.toFixed(2)}
                  </span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({couponCode})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-300 pt-2 text-xl font-bold text-gray-800">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={onNext}
              variant="primary"
              size="xl"
              rounded="full"
              className="relative mt-8 w-full items-center justify-start !text-left shadow-lg sm:!text-xl"
              icon={
                <Image
                  src="/arrow-right.png"
                  alt="arrow-right"
                  width={24}
                  height={24}
                  className="text-blue absolute top-1/2 right-2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2"
                />
              }
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Checkout Details Tab Component
const CheckoutDetailsTab = ({
  onNext,
  //   onBack,
  formData,
  setFormData,
  isProcessing = false,
}: {
  onNext: () => void;
  //   onBack: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  isProcessing?: boolean;
}) => {
  const {
    items,
    totalPrice,
    shippingInfo,
    discount,
    couponCode,
    updateQuantity,
    removeItem,
    setCouponCode,
    setDiscount,
    getCartTotal,
    isItemLoading,
  } = useCart();

  const [localCouponCode, setLocalCouponCode] = useState(couponCode);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const applyDiscount = () => {
    if (localCouponCode.toLowerCase() === "save10") {
      setDiscount(totalPrice * 0.1);
      setCouponCode(localCouponCode);
      toast.success("Coupon applied successfully!");
    } else if (localCouponCode.toLowerCase() === "jenkatemw") {
      setDiscount(25);
      setCouponCode(localCouponCode);
      toast.success("Coupon applied successfully!");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const subtotal = totalPrice;
  const total = getCartTotal();

  return (
    <div className="px-[32px]">
      <div className="mt-20 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Form Section */}
        <div className="space-y-8 lg:col-span-2">
          {/* Contact Information */}
          <div className="rounded-xl bg-[#ffffff] p-6">
            <h1 className="mb-6 text-[45px] text-[#222222]">
              CONTACT INFORMATION
            </h1>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-[#999999]"
                >
                  FIRST NAME
                </Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  className="rounded-full border-[#999]"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
              </div>
              <div>
                <Label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-[#999999]"
                >
                  LAST NAME
                </Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  className="rounded-full border-[#999]"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="mb-4">
              <Label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-[#999999]"
              >
                PHONE NUMBER
              </Label>
              <Input
                id="phone"
                placeholder="Phone number"
                className="rounded-full border-[#999]"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#999999]"
              >
                EMAIL ADDRESS
              </Label>
              <Input
                id="email"
                placeholder="Your Email"
                className="rounded-full border-[#999]"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl bg-[#ffffff] p-6">
            <h1 className="mb-6 text-[45px] text-[#222222]">
              SHIPPING ADDRESS
            </h1>
            <div className="mb-4">
              <Label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-[#999999]"
              >
                STREET ADDRESS *
              </Label>
              <Input
                id="address"
                placeholder="Street Address"
                className="rounded-full border-[#999]"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
            <div className="mb-4 w-full">
              <Label
                htmlFor="country"
                className="mb-2 block w-full text-sm font-medium text-[#999999]"
              >
                COUNTRY *
              </Label>
              <Select
                value={formData.country}
                onValueChange={(value) => handleInputChange("country", value)}
              >
                <SelectTrigger className="w-full rounded-full border-[#999]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label
                htmlFor="city"
                className="mb-2 block text-sm font-medium text-[#999999]"
              >
                TOWN / CITY *
              </Label>
              <Input
                id="city"
                placeholder="Town / City"
                className="rounded-full border-[#999]"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label
                  htmlFor="state"
                  className="mb-2 block text-sm font-medium text-[#999999]"
                >
                  STATE
                </Label>
                <Input
                  id="state"
                  placeholder="State"
                  className="rounded-full border-[#999]"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </div>
              <div>
                <Label
                  htmlFor="zip"
                  className="mb-2 block text-sm font-medium text-[#999999]"
                >
                  ZIP CODE
                </Label>
                <Input
                  id="zip"
                  placeholder="Zip Code"
                  className="rounded-full border-[#999]"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="billing"
                checked={formData.differentBilling}
                onCheckedChange={(checked) =>
                  handleInputChange("differentBilling", checked as boolean)
                }
              />
              <Label htmlFor="billing" className="text-sm text-[#999999]">
                Use a different billing address (optional)
              </Label>
            </div>
          </div>

          {/* Payment Method */}
          {/* <div className="rounded-xl bg-[#ffffff] p-6">
            <h1 className="mb-6 text-[45px] text-[#222222]">PAYMENT METHOD</h1>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) =>
                handleInputChange("paymentMethod", value as "card" | "paypal")
              }
              className="mb-6 space-y-4"
            >
              <div className="flex items-center space-x-2 rounded-full border border-[#999] p-3">
                <RadioGroupItem
                  value="card"
                  id="card"
                  className="text-[#222]"
                />
                <Label htmlFor="card" className="flex-1">
                  Pay by Card Credit
                </Label>
                <div className="flex space-x-2">
                  <Image src="/p-1.png" alt="visa" width={20} height={20} />
                </div>
              </div>
              <div className="flex items-center space-x-2 rounded-full border border-[#999] p-3">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex-1">
                  Paypal
                </Label>
              </div>
            </RadioGroup>
            <div className="mb-4">
              <Label
                htmlFor="cardNumber"
                className="mb-2 block text-sm font-medium text-[#999999]"
              >
                CARD NUMBER
              </Label>
              <Input
                id="cardNumber"
                placeholder="1234 1234 1234"
                className="rounded-full border-[#999]"
                value={formData.cardNumber}
                onChange={(e) =>
                  handleInputChange("cardNumber", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="expiry"
                  className="mb-2 block text-sm font-medium text-[#999999]"
                >
                  EXPIRATION DATE
                </Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  className="rounded-full border-[#999]"
                  value={formData.expiry}
                  onChange={(e) => handleInputChange("expiry", e.target.value)}
                />
              </div>
              <div>
                <Label
                  htmlFor="cvv"
                  className="mb-2 block text-sm font-medium text-[#999999]"
                >
                  CVV
                </Label>
                <Input
                  id="cvv"
                  placeholder="CVC code"
                  className="rounded-full border-[#999]"
                  value={formData.cvc}
                  onChange={(e) => handleInputChange("cvc", e.target.value)}
                />
              </div>
            </div>
          </div> */}

          <div className="flex gap-4">
            <Button
              onClick={onNext}
              disabled={isProcessing}
              variant="primary"
              size="xl"
              rounded="full"
              className="bg-blue hover:bg-blue/90 relative mx-auto flex w-full items-center justify-start px-8 py-4 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              icon={
                !isProcessing ? (
                  <Image
                    src="/arrow-right.png"
                    alt="Arrow Right"
                    width={30}
                    height={30}
                    className="absolute top-1/2 right-4 h-10 w-10 -translate-y-1/2 rounded-full bg-white object-contain p-2"
                  />
                ) : null
              }
            >
              {isProcessing ? "Processing Payment..." : "Place Order"}
            </Button>
          </div>
        </div>

        {/* Order Summary - Matching attached UI */}
        <div className="lg:w-[413px]">
          <div className="bg-light-blue rounded-lg p-4">
            <h1 className="text-dark-gray mb-6 text-[45px] uppercase">
              Order Summary
            </h1>

            {/* Items List */}
            {items.map((item) => (
              <div key={item.id} className="mb-4 border-b border-gray-200 pb-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="relative h-[120px] w-[120px] rounded-2xl bg-white">
                    <SafeImage
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="h-full w-full rounded object-contain"
                    />
                  </div>
                  <div className="flex-1 py-4">
                    <h3 className="text-[27px] text-[#222] uppercase">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[#999] capitalize">
                      Color: {item.color || "Black"}
                    </p>
                    <div className="mt-1 inline-block rounded bg-[#56748e] px-2 py-1 text-xs text-[#fff]">
                      3 To 4 Days Delivery
                    </div>
                    {/* Quantity Controls */}
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-full border border-gray-300">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center transition-colors duration-200 hover:bg-gray-50"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center transition-colors duration-200 hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#222]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isItemLoading(item.id)}
                      className="text-xs text-[#999] hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isItemLoading(item.id) ? (
                        <Loader2 className="inline h-5 w-5 animate-spin" />
                      ) : (
                        <X className="inline h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Coupon Section */}
            <div className="mb-4">
              <div className="flex items-center overflow-hidden rounded-full border border-[#999999]">
                <div className="flex items-center justify-center px-3 py-2">
                  <Image src="/t-1.png" alt="Coupon" width={20} height={20} />
                </div>
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={localCouponCode}
                  onChange={(e) => setLocalCouponCode(e.target.value)}
                  className="flex-1 px-0 py-3 focus:outline-none"
                />
                <button
                  onClick={applyDiscount}
                  className="bg-blue hover:bg-blue/80 mr-2 flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-white"
                >
                  <Image
                    src="/arrow-right1.png"
                    alt="Apply"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
              {discount > 0 && (
                <div className="mt-2 flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <Image src="/t-2.png" alt="Coupon" width={20} height={20} />
                    <span className="text-sm font-medium text-[#222]">
                      {couponCode}
                    </span>
                  </div>
                  <span className="text-sm text-[#999]">
                    -${discount.toFixed(2)} [Remove]
                  </span>
                </div>
              )}
            </div>

            {/* Shipping Information */}
            <div className="mb-4 text-sm">
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingInfo.cost === 0
                    ? "Free"
                    : `$${shippingInfo.cost.toFixed(2)}`}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {shippingInfo.label}
              </div>
            </div>

            {/* Price Summary */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Complete Tab Component
const OrderCompleteTab = ({ orderData }: { orderData: OrderData }) => {
  return (
    <div className="mt-20 px-[32px] text-center">
      <div className="bg-light-blue mb-8 rounded-2xl p-12">
        {/* Thank You Section */}
        <div className="mb-8">
          <h2 className="text-gray mb-2 text-[28px] font-bold tracking-wide">
            THANK YOU! 🎉
          </h2>
          <h1 className="text-dark-gray text-6xl leading-tight tracking-tight">
            YOUR ORDER HAS BEEN
            <br />
            CONFIRMED
          </h1>
        </div>

        {/* Product Images */}
        <div className="mb-12 flex items-center justify-center gap-6">
          {orderData.items.map((item) => (
            <div key={item.id} className="relative">
              <div className="h-32 w-40 rounded-xl bg-white p-2 shadow-sm">
                <SafeImage
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>
              <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {item.quantity}
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="mx-auto mb-10 max-w-sm rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-[#999]">Order code:</p>
              <p className="text-[#222]">{orderData.orderCode}</p>
            </div>
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-[#999]">Date:</p>
              <p className="text-[#222]">{orderData.date}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#999]">Total:</p>
              <p className="text-[#222]">${orderData.total}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#999]">
                Payment method:
              </p>
              <p className="text-[#222]">{orderData.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <Button
          onClick={() => (window.location.href = "/")}
          variant="primary"
          size="xl"
          rounded="full"
          className="bg-blue hover:bg-blue/90 relative mx-auto flex w-full items-center justify-start px-6 py-3 font-semibold text-white shadow-lg sm:w-[80%] sm:px-8 sm:py-4 lg:w-[70%]"
          icon={
            <Image
              src="/arrow-right.png"
              alt="Arrow Right"
              width={24}
              height={24}
              className="absolute top-1/2 right-3 h-8 w-8 -translate-y-1/2 rounded-full bg-white object-contain p-1.5 sm:right-4 sm:h-10 sm:w-10 sm:p-2"
            />
          }
        >
          Back To Home
        </Button>
      </div>
    </div>
  );
};

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    totalItems,
    getCartTotal,
    error: cartError,
    checkAuthStatus,
    syncWithServer,
  } = useCart();

  // All useState hooks must be at the top
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderData] = useState<OrderData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    country: "",
    city: "",
    state: "",
    zipCode: "",
    differentBilling: false,
    paymentMethod: "card",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  // Update email when user data is available
  useEffect(() => {
    if (user?.data?.user?.email && formData.email === "") {
      setFormData((prev) => ({
        ...prev,
        email: user.data.user.email,
      }));
    }
  }, [user, formData.email]);

  // Effect to handle authentication status changes and cart syncing
  useEffect(() => {
    const handleAuthAndCartSync = async () => {
      try {
        console.log("Cart page: Checking auth status and syncing cart...", {
          user: !!user,
          authLoading,
          totalItems,
        });

        // Check authentication status and sync cart accordingly
        await checkAuthStatus();

        // If user is authenticated, ensure we have the latest cart data from server
        if (user && !authLoading) {
          console.log(
            "Cart page: User is authenticated, syncing cart with server..."
          );
          await syncWithServer();
          console.log(
            "Cart page: Cart sync completed, items count:",
            totalItems
          );
        } else if (!user && !authLoading) {
          console.log("Cart page: User not authenticated, using guest cart");
        }
      } catch (error) {
        console.error("Cart page: Error syncing cart:", error);
        // Don't show error toast here as it might be too intrusive
        // The cart store will handle error states internally
      }
    };

    // Only run if we're not in the middle of auth loading
    if (!authLoading) {
      handleAuthAndCartSync();
    }
  }, [user, authLoading, checkAuthStatus, syncWithServer, totalItems]);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  //   const handleBack = () => {
  //     setCurrentStep(currentStep - 1);
  //   };

  // Show loading state while authentication is being determined
  if (authLoading) {
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
            <p className="text-lg font-medium">Loading cart details...</p>
            <p className="text-muted-foreground text-sm">
              Please wait while we fetch your cart information
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's a cart error
  if (cartError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg bg-red-50 px-4 py-12">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-4 text-2xl font-bold">Error Loading Cart</h1>
          <p className="mb-8 text-center text-gray-600">{cartError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue hover:bg-blue/90 rounded px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      setIsProcessingPayment(true);

      // Validate required fields
      const validationErrors = validateFormData();
      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]);
        setIsProcessingPayment(false);
        return;
      }

      // Prepare payment request data
      const paymentData: CreatePaymentRequest = {
        contact_first_name: formData.firstName,
        contact_last_name: formData.lastName,
        contact_email: formData.email,
        contact_phone: formData.phone
          ? formatPhoneNumber(formData.phone)
          : undefined,

        shipping_address: {
          street_address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: getCountryCode(formData.country),
          country_name: getCountryName(getCountryCode(formData.country)),
        },

        use_different_billing_address: formData.differentBilling,
        billing_address: formData.differentBilling
          ? {
              street_address: formData.address, // For now, using same address
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: getCountryCode(formData.country),
              country_name: getCountryName(getCountryCode(formData.country)),
            }
          : undefined,

        cart_items: convertCartItemsToPaymentFormat(items),
        order_notes: undefined,
      };

      // Debug: Log cart items before conversion
      console.log("🛒 Cart items before conversion:", items);
      console.log(
        "🔄 Converted cart items:",
        convertCartItemsToPaymentFormat(items)
      );

      // Validate payment data
      const errors = PaymentApiService.validatePaymentData(paymentData);
      if (errors.length > 0) {
        toast.error(errors[0]);
        setIsProcessingPayment(false);
        return;
      }

      // Create payment with backend
      const paymentResponse =
        await PaymentApiService.createPayment(paymentData);

      // Log payment attempt
      logPaymentAttempt(paymentData, paymentResponse);

      // Store order ID for later reference
      storeOrderId(paymentResponse.order_id);

      // Store order data for success page
      const orderDataForSuccess = {
        orderCode: `#${paymentResponse.order_id.slice(-8).toUpperCase()}`,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        total: getCartTotal().toFixed(2),
        paymentMethod: "Credit Card",
        items: items,
      };

      try {
        localStorage.setItem(
          "lastOrderData",
          JSON.stringify(orderDataForSuccess)
        );
        console.log(
          "💾 Stored order data for success page:",
          orderDataForSuccess
        );
      } catch (storageError) {
        console.warn("⚠️ Could not store order data:", storageError);
      }

      // Redirect to NatWest payment page immediately
      console.log("🚀 Redirecting to payment page...");
      redirectToPayment(paymentResponse);
    } catch (error: unknown) {
      console.error("Payment creation error:", error);
      setIsProcessingPayment(false);

      const errorMessage = getPaymentErrorMessage(error);
      toast.error(errorMessage);

      // Handle specific error types
      const paymentError = error as PaymentError;
      if (paymentError?.status === 400 && paymentError?.details) {
        // Show validation errors
        paymentError.details.forEach((detail) => {
          toast.error(`${detail.field}: ${detail.message}`);
        });
      } else if (paymentError?.status === 409 && paymentError?.stock_issues) {
        // Show stock issues
        paymentError.stock_issues.forEach((issue) => {
          toast.error(
            `${issue.variant_id}: Only ${issue.available} items available, but ${issue.requested} requested`
          );
        });
      }
    }
  };

  const validateFormData = (): string[] => {
    const errors: string[] = [];

    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.address.trim()) errors.push("Address is required");
    if (!formData.city.trim()) errors.push("City is required");
    if (!formData.zipCode.trim()) errors.push("Zip code is required");
    if (!formData.country.trim()) errors.push("Country is required");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }

    return errors;
  };

  const getCountryCode = (country: string): string => {
    const countryMap: Record<string, string> = {
      us: "US",
      uk: "GB",
      ca: "CA",
    };
    return countryMap[country] || "GB";
  };

  if (totalItems === 0 && currentStep === 1) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg bg-gray-50 px-4 py-12">
          <div className="mb-4 text-6xl">🛒</div>
          <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mb-8 text-center text-gray-600">
            Looks like you haven&apos;t added any products to your cart yet.
            Start shopping to add products.
          </p>
          <Button
            onClick={() => (window.location.href = "/products")}
            className="bg-blue hover:bg-blue/90"
          >
            Shop Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-[32px] py-8">
      <h1 className="mt-10 mb-8 text-center text-6xl">
        {currentStep === 1
          ? "CART"
          : currentStep === 2
            ? "CHECKOUT DETAILS"
            : "ORDER COMPLETE"}
      </h1>

      <CartSteps currentStep={currentStep} />

      {currentStep === 1 && <ShoppingCartTab onNext={handleNext} />}

      {currentStep === 2 && (
        <CheckoutDetailsTab
          onNext={handlePlaceOrder}
          //   onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
          isProcessing={isProcessingPayment}
        />
      )}

      {currentStep === 3 && orderData && (
        <OrderCompleteTab orderData={orderData} />
      )}
    </div>
  );
}
