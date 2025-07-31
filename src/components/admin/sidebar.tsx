"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Home,
  ShoppingCart,
  FolderTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/providers/auth-provider";
import React from "react";
import Image from "next/image";

export const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <Home className="mr-3 h-5 w-5" />,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: <Package className="mr-3 h-5 w-5" />,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: <FolderTree className="mr-3 h-5 w-5" />,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: <ShoppingCart className="mr-3 h-5 w-5" />,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: <Users className="mr-3 h-5 w-5" />,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: <CreditCard className="mr-3 h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: <Settings className="mr-3 h-5 w-5" />,
  },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();

  // Helper function to adjust icon classes based on sidebar state
  const getIconClasses = (icon: React.ReactNode) => {
    if (isCollapsed) {
      // Remove margin when collapsed
      return React.cloneElement(
        icon as React.ReactElement<{ className?: string }>,
        {
          className: "h-5 w-5",
        }
      );
    }
    return icon;
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[240px]"
      )}
    >
      <div className="border-border flex items-center justify-between border-b p-4">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "w-full justify-center" : ""
          )}
        >
          {!isCollapsed ? (
            <div className="flex items-center">
              <Image
                src="/logo.webp"
                alt="Sofa Deal Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-bold">Sofa Deal</span>
            </div>
          ) : (
            <Image
              src="/logo.webp"
              alt="Sofa Deal Logo"
              width={32}
              height={32}
              className="rounded-sm"
            />
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {adminNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "hover:bg-muted hover:text-primary flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {getIconClasses(item.icon)}
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-border border-t p-4">
        <button
          onClick={() => signOut()}
          className={cn(
            "text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
