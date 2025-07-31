"use client";

import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Check if user is admin
  //   useEffect(() => {
  //     if (!isLoading && (!user || user.role !== "admin")) {
  //       router.push("/login");
  //     }
  //   }, [user, isLoading, router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <main className="h-full">{children}</main>
      </div>
    </div>
  );
}
