"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  LogOut,
  Heart,
  ChevronDown,
  Trash2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useAuth } from "@/lib/providers/auth-provider";
import { SearchDropdown } from "@/components/search/search-dropdown";
import Logo from "../../public/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { toast } from "sonner";
import { LanguageSelector } from "./languague-selector";

export function Navbar() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Memoize pathname-dependent calculations
  const isHomePage = useMemo(() => {
    return (
      pathname === "/" ||
      pathname === "/products" ||
      pathname === "/contact-us" ||
      pathname === "/about-us"
    );
  }, [pathname]);

  const {
    items: cartItems,
    totalItems,
    totalPrice,
    removeItem: removeFromCart,
    isItemLoading,
  } = useCart();
  const {
    items: wishlistItems,
    totalItems: wishlistCount,
    removeItem: removeFromWishlist,
    isItemLoading: isWishlistItemLoading,
  } = useWishlist();
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isWishlistDropdownOpen, setIsWishlistDropdownOpen] = useState(false);

  // Track client-side hydration to prevent SSR mismatches
  useEffect(() => {
    setIsClient(true);
    // Immediately check scroll position on hydration
    if (typeof window !== "undefined" && window.scrollY > 20) {
      setIsScrolled(true);
    }
  }, []);

  // Handle navbar background change on scroll with hydration safety
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      if (typeof window !== "undefined" && window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check initial scroll position on mount
    const checkInitialScroll = () => {
      if (typeof window !== "undefined" && window.scrollY > 20) {
        setIsScrolled(true);
      }
    };

    // Check scroll position immediately after hydration
    checkInitialScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  const handleRemoveFromCart = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      await removeFromWishlist(itemId);
      toast.success("Item removed from wishlist");
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error);
      toast.error("Failed to remove item");
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          isScrolled
            ? "bg-background/95 supports-[backdrop-filter]:bg-background/80 h-[64px] border-b shadow-sm backdrop-blur"
            : "bg-background/95 h-[64px]"
        }`}
      >
        {/* Background for right 50% - only on desktop, home page, and when not scrolled */}
        {isClient && !isScrolled && isHomePage && (
          <div
            className="pointer-events-none absolute inset-0 hidden w-full overflow-hidden lg:block"
            style={{ height: "64px" }}
          >
            <div className="relative mx-auto h-full px-4">
              <div
                className={`bg-light-blue absolute right-0 h-full transition-all duration-200 ${
                  pathname === "/products" ||
                  pathname === "/contact-us" ||
                  pathname === "/about-us"
                    ? "md:w-[50%] 2xl:w-[50%]"
                    : "w-[50%] pl-[0px]"
                }`}
              ></div>
            </div>
          </div>
        )}

        {/* Main navbar */}
        <div className="relative z-10 px-[32px]">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-10 w-32">
                <Image
                  src={Logo}
                  alt="Sofa Deal"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden items-center space-x-6 text-base lg:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group text-gray hover:text-[#222222]"
                    size="sm"
                  >
                    <span className="font-open-sans text-base">Sofa Type</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      Corner Sofas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      U-Shaped Sofas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      L-Shaped Sofas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      Chaise End Sofas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      Recliner Sofas
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group text-gray hover:text-[#222222] md:hidden xl:flex"
                    size="sm"
                  >
                    <span className="font-open-sans text-base">Sofa Size</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      2 Seater
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      3 Seater
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      4 Seater
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      3+2 Seater Sets
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group text-gray hover:text-[#222222]"
                    size="sm"
                  >
                    <span className="font-open-sans text-base">Materials</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      Fabric Sofas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      Leather Sofas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="font-open-sans cursor-pointer"
                    >
                      Velvet Sofas
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/products"
                className="font-open-sans text-gray hover:text-navy transition-colors hover:text-[#222222]"
              >
                All Products
              </Link>

              <Link
                href="/about-us"
                className="font-open-sans text-gray hover:text-navy transition-colors hover:text-[#222222]"
              >
                About Us
              </Link>

              <Link
                href="/contact-us"
                className="font-open-sans text-gray hover:text-navy transition-colors hover:text-[#222222]"
              >
                Contact Us
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Language selector */}
              <LanguageSelector />

              {/* Search - Desktop */}
              <div className="hidden md:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray hover:text-[#222222]"
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                >
                  <Image
                    src="/n-1.png"
                    alt="Search"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </Button>
              </div>

              {/* Search - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray hover:text-[#222222] md:hidden"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                <Image
                  src="/n-1.png"
                  alt="Search"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </Button>

              {/* Wishlist Dropdown */}
              <DropdownMenu
                open={isWishlistDropdownOpen}
                onOpenChange={setIsWishlistDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray relative"
                  >
                    <Heart className="h-5 w-5 text-[#212121]" />
                    {isClient && wishlistCount > 0 && (
                      <Badge className="bg-blue absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs text-white hover:bg-blue-700">
                        {wishlistCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <h2 className="font-open-sans mb-3 font-semibold">
                      Wishlist ({isClient ? wishlistCount : 0} items)
                    </h2>
                    {wishlistItems.length === 0 ? (
                      <p className="text-muted-foreground font-open-sans text-sm">
                        Your wishlist is empty
                      </p>
                    ) : (
                      <div className="max-h-96 space-y-3 overflow-y-auto">
                        {wishlistItems.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="hover:bg-muted/50 flex items-center gap-3 rounded-md p-2"
                          >
                            <div className="bg-muted h-12 w-12 overflow-hidden rounded border">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-contain bg-white"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-open-sans truncate text-sm font-medium">
                                {item.name}
                              </p>
                              <p className="text-muted-foreground font-open-sans text-sm">
                                £{item.price.toFixed(2)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:text-destructive h-8 w-8"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                              disabled={isWishlistItemLoading(item.variant_id)}
                            >
                              {isWishlistItemLoading(item.variant_id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                        {wishlistItems.length > 4 && (
                          <p className="text-muted-foreground font-open-sans text-center text-sm">
                            +{wishlistItems.length - 4} more items
                          </p>
                        )}
                      </div>
                    )}
                    {wishlistItems.length > 0 && (
                      <div className="mt-4 border-t pt-3">
                        <Button
                          asChild
                          className="bg-blue hover:bg-blue/90 font-open-sans w-full text-white"
                          onClick={() => setIsWishlistDropdownOpen(false)}
                        >
                          <Link href="/wishlist">
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-gray focus:ring-blue relative hover:text-[#222222] focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    >
                      <Image
                        src="/n-2.png"
                        alt="User"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                      {/* Green dot indicator for logged in status */}
                      {/* <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div> */}
                      <span className="sr-only">User menu - Logged in</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                    sideOffset={5}
                  >
                    <div className="flex flex-col space-y-1 p-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="font-open-sans text-sm font-medium">
                          {user?.data?.user?.email?.split("@")[0]}
                        </p>
                      </div>
                      <p className="text-muted-foreground font-open-sans ml-4 text-xs">
                        {user?.data?.user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="font-open-sans w-full cursor-pointer"
                      >
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/orders"
                        className="font-open-sans w-full cursor-pointer"
                      >
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/wishlist"
                        className="font-open-sans w-full cursor-pointer"
                      >
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        signOut();
                      }}
                      className="font-open-sans cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Desktop: Show login text with icon */}
                  <div className="hidden md:flex">
                    <Link href="/login" className="flex items-center gap-2">
                      <Image
                        src="/n-2.png"
                        alt="User"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                      <span className="font-open-sans text-gray text-sm">
                        Login
                      </span>
                    </Link>
                  </div>
                  {/* Mobile: Show icon only */}
                  <div className="md:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="text-gray hover:text-[#222222]"
                    >
                      <Link href="/login">
                        <Image
                          src="/n-2.png"
                          alt="User"
                          width={20}
                          height={20}
                          className="h-5 w-5"
                        />
                        <span className="sr-only">Login</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Cart */}
              <DropdownMenu
                open={isCartDropdownOpen}
                onOpenChange={setIsCartDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray relative hover:text-[#222222]"
                  >
                    <Image
                      src="/n-3.png"
                      alt="Cart"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                    {isClient && totalItems > 0 && (
                      <Badge className="bg-blue absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs text-white hover:bg-blue-700">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <h2 className="font-open-sans mb-3 font-semibold">
                      Cart ({isClient ? totalItems : 0} items)
                    </h2>
                    {cartItems.length === 0 ? (
                      <p className="text-muted-foreground font-open-sans text-sm">
                        Your cart is empty
                      </p>
                    ) : (
                      <div className="max-h-96 space-y-3 overflow-y-auto">
                        {cartItems.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="hover:bg-muted/50 flex items-center gap-3 rounded-md p-2"
                          >
                            <div className="bg-muted h-12 w-12 overflow-hidden rounded border">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-contain bg-white"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-open-sans truncate text-sm font-medium">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-muted-foreground font-open-sans text-sm">
                                  £{item.price.toFixed(2)} x {item.quantity}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:text-destructive h-8 w-8"
                              onClick={() => handleRemoveFromCart(item.id)}
                              disabled={isItemLoading(item.id)}
                            >
                              {isItemLoading(item.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                        {cartItems.length > 4 && (
                          <p className="text-muted-foreground font-open-sans text-center text-sm">
                            +{cartItems.length - 4} more items
                          </p>
                        )}
                      </div>
                    )}
                    {cartItems.length > 0 && (
                      <div className="mt-4 space-y-3 border-t pt-3">
                        <div className="font-open-sans flex items-center justify-between font-semibold">
                          <span>Total:</span>
                          <span>£{totalPrice.toFixed(2)}</span>
                        </div>
                        <Button
                          asChild
                          className="bg-blue hover:bg-blue/90 font-open-sans w-full text-white"
                          onClick={() => setIsCartDropdownOpen(false)}
                        >
                          <Link href="/cart">
                            View Cart <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu */}
              <div className="lg:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray hover:text-dark-gray"
                    >
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="h-full w-[80vw] max-w-md overflow-y-auto p-0 sm:w-[350px]"
                  >
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between border-b px-4 py-4">
                        <Link
                          href="/"
                          className="flex items-center gap-2"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <div className="relative h-10 w-32">
                            <Image
                              src={Logo}
                              alt="Sofa Deal"
                              fill
                              className="object-cover"
                              priority
                            />
                          </div>
                        </Link>
                      </div>

                      <nav className="flex flex-grow flex-col gap-5 overflow-y-auto px-4 py-6">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem
                            value="sofa-types"
                            className="border-b"
                          >
                            <AccordionTrigger className="font-open-sans py-3">
                              Sofa Types
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                              <div className="flex flex-col space-y-2">
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  Corner Sofas
                                </Link>
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  U-Shaped Sofas
                                </Link>
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  L-Shaped Sofas
                                </Link>
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  Chaise End Sofas
                                </Link>
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  Recliner Sofas
                                </Link>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem
                            value="sofa-sizes"
                            className="border-b"
                          >
                            <AccordionTrigger className="font-open-sans py-3">
                              Sofa Sizes
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                              <div className="flex flex-col space-y-2">
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  2 Seater
                                </Link>
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  3 Seater
                                </Link>
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  4 Seater
                                </Link>
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  3+2 Seater Sets
                                </Link>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="materials" className="border-b">
                            <AccordionTrigger className="font-open-sans py-3">
                              Materials
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                              <div className="flex flex-col space-y-2">
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  Fabric Sofas
                                </Link>
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  Leather Sofas
                                </Link>
                                <Link
                                  href="/products"
                                  className="font-open-sans text-base"
                                  onClick={() => setIsSheetOpen(false)}
                                >
                                  Velvet Sofas
                                </Link>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <div className="space-y-3 border-b pb-5">
                          <Link
                            href="/products"
                            className="font-open-sans flex items-center text-base font-medium"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            All Products
                          </Link>
                          <Link
                            href="/about-us"
                            className="font-open-sans flex items-center text-base font-medium"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            About Us
                          </Link>
                          <Link
                            href="/contact-us"
                            className="font-open-sans flex items-center text-base font-medium"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            Contact Us
                          </Link>
                        </div>

                        {user ? (
                          <div className="border-b pb-5">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <p className="text-muted-foreground font-open-sans text-xs font-medium uppercase">
                                Account - Logged In
                              </p>
                            </div>
                            <div className="space-y-3">
                              <div className="rounded-md border border-green-200 bg-green-50 p-3">
                                <p className="font-open-sans text-sm font-medium text-green-800">
                                  Signed in as
                                </p>
                                <p className="font-open-sans text-sm font-bold text-green-900">
                                  {user?.data?.user?.email}
                                </p>
                              </div>
                              <Link
                                href="/profile"
                                className="font-open-sans flex items-center text-base font-medium"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                My Account
                              </Link>
                              <Link
                                href="/orders"
                                className="font-open-sans flex items-center text-base font-medium"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                My Orders
                              </Link>
                              <Link
                                href="/wishlist"
                                className="font-open-sans flex items-center text-base font-medium"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                Wishlist ({isClient ? wishlistCount : 0})
                              </Link>
                              <Link
                                href="/cart"
                                className="font-open-sans flex items-center text-base font-medium"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                Cart ({isClient ? totalItems : 0})
                              </Link>
                              <Button
                                variant="ghost"
                                className="font-open-sans justify-start px-0 text-base font-medium"
                                onClick={() => {
                                  signOut();
                                  setIsSheetOpen(false);
                                }}
                              >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-b pb-5">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                              <p className="text-muted-foreground font-open-sans text-xs font-medium uppercase">
                                Account - Not Logged In
                              </p>
                            </div>
                            <div className="space-y-4">
                              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                                <p className="font-open-sans mb-2 text-sm text-blue-800">
                                  Sign in to access your account, orders, and
                                  wishlist.
                                </p>
                              </div>
                              <Link
                                href="/login"
                                className="font-open-sans flex items-center text-base font-medium"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                Login
                              </Link>
                              <Button
                                asChild
                                className="bg-blue hover:bg-blue/90 font-open-sans w-full text-white"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                <Link href="/register">Register</Link>
                              </Button>
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-muted-foreground font-open-sans mb-3 text-xs font-medium uppercase">
                            Customer Support
                          </p>
                          <div className="space-y-3">
                            <Link
                              href="/contact"
                              className="font-open-sans flex items-center text-base font-medium"
                              onClick={() => setIsSheetOpen(false)}
                            >
                              Contact Us
                            </Link>
                            <Link
                              href="#"
                              className="font-open-sans flex items-center text-base font-medium"
                              onClick={() => setIsSheetOpen(false)}
                            >
                              FAQs
                            </Link>
                            <Link
                              href="#"
                              className="font-open-sans flex items-center text-base font-medium"
                              onClick={() => setIsSheetOpen(false)}
                            >
                              Returns Policy
                            </Link>
                          </div>
                        </div>
                      </nav>

                      <div className="text-muted-foreground mt-auto border-t px-4 py-4 text-center text-sm">
                        <p className="font-open-sans">
                          © 2025 Sofa Deal. All rights reserved.
                        </p>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {isMobileSearchOpen && (
          <div className="bg-background border-t p-3">
            <SearchDropdown
              placeholder="Search for products..."
              onResultClick={() => setIsMobileSearchOpen(false)}
            />
          </div>
        )}
      </header>
    </>
  );
}
