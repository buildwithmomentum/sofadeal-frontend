"use client";

import { useState } from "react";
import {
  PackageIcon,
  ShoppingCart,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardChart from "@/components/admin/dashboard-chart";
import RecentOrdersTable from "@/components/admin/recent-orders-table";

// Demo data - Replace with actual data in production
const DEMO_OVERVIEW = {
  totalRevenue: 24560,
  totalOrders: 156,
  totalCustomers: 312,
  productsInStock: 89,
  pendingShipments: 23,
  todaySales: 1230,
  totalReturns: 8,
};

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const router = useRouter();

  return (
    <div className="flex-1 space-y-4 p-6 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Tabs
            defaultValue="7d"
            className="space-y-4"
            onValueChange={setSelectedPeriod}
          >
            <TabsList>
              <TabsTrigger value="1d">Today</TabsTrigger>
              <TabsTrigger value="7d">Weekly</TabsTrigger>
              <TabsTrigger value="30d">Monthly</TabsTrigger>
              <TabsTrigger value="90d">Quarterly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/admin/transactions")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${DEMO_OVERVIEW.totalRevenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="flex items-center text-emerald-500">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12.5% from last{" "}
                {selectedPeriod === "1d"
                  ? "day"
                  : selectedPeriod === "7d"
                    ? "week"
                    : selectedPeriod === "30d"
                      ? "month"
                      : "quarter"}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/admin/orders")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {DEMO_OVERVIEW.totalOrders}
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="flex items-center text-emerald-500">
                <TrendingUp className="mr-1 h-3 w-3" />
                +8.2% from last{" "}
                {selectedPeriod === "1d"
                  ? "day"
                  : selectedPeriod === "7d"
                    ? "week"
                    : selectedPeriod === "30d"
                      ? "month"
                      : "quarter"}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/admin/customers")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {DEMO_OVERVIEW.totalCustomers}
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="flex items-center text-emerald-500">
                <TrendingUp className="mr-1 h-3 w-3" />
                +4.6% from last{" "}
                {selectedPeriod === "1d"
                  ? "day"
                  : selectedPeriod === "7d"
                    ? "week"
                    : selectedPeriod === "30d"
                      ? "month"
                      : "quarter"}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/admin/products")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Products in Stock
            </CardTitle>
            <PackageIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {DEMO_OVERVIEW.productsInStock}
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="flex items-center text-red-500">
                <TrendingDown className="mr-1 h-3 w-3" />
                -2.3% from last{" "}
                {selectedPeriod === "1d"
                  ? "day"
                  : selectedPeriod === "7d"
                    ? "week"
                    : selectedPeriod === "30d"
                      ? "month"
                      : "quarter"}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Sales data for{" "}
              {selectedPeriod === "1d"
                ? "today"
                : selectedPeriod === "7d"
                  ? "the past week"
                  : selectedPeriod === "30d"
                    ? "the past month"
                    : "the past quarter"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart period={selectedPeriod} />
          </CardContent>
          <CardFooter>
            <Link
              href="/admin/transactions"
              className="text-primary text-sm hover:underline"
            >
              View all transactions
            </Link>
          </CardFooter>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Recent customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable />
          </CardContent>
          <CardFooter>
            <Link
              href="/admin/orders"
              className="text-primary text-sm hover:underline"
            >
              View all orders
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
