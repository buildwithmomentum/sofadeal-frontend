"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  TruckIcon,
  Package,
  Download,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Demo data
const ORDERS_DATA = [
  {
    id: "ORD-7652",
    customer: "John Smith",
    email: "john.smith@example.com",
    products: ["Modern Sofa (Gray)"],
    total: 1299.99,
    status: "delivered",
    date: new Date("2023-05-15T14:30:00"),
    address: "123 Main St, Anytown, CA 12345",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-7651",
    customer: "Sarah Johnson",
    email: "sarah.j@example.com",
    products: ["Modern Coffee Table"],
    total: 249.99,
    status: "processing",
    date: new Date("2023-05-15T10:15:00"),
    address: "456 Oak Ave, Somewhere, NY 67890",
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-7650",
    customer: "Michael Brown",
    email: "mbrown@example.com",
    products: ["Modern Sectional Sofa"],
    total: 2399.99,
    status: "shipped",
    date: new Date("2023-05-14T09:45:00"),
    address: "789 Pine Rd, Elsewhere, TX 54321",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-7649",
    customer: "Emma Wilson",
    email: "emma.wilson@example.com",
    products: ["Leather Recliner"],
    total: 899.99,
    status: "pending",
    date: new Date("2023-05-14T16:20:00"),
    address: "101 Elm Blvd, Nowhere, FL 13579",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-7648",
    customer: "David Lee",
    email: "david.lee@example.com",
    products: ["Accent Chair"],
    total: 349.99,
    status: "cancelled",
    date: new Date("2023-05-13T11:30:00"),
    address: "202 Maple Ct, Anywhere, WA 24680",
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-7647",
    customer: "Jennifer Garcia",
    email: "jgarcia@example.com",
    products: ["Dining Table Set", "Table Lamp"],
    total: 1699.99,
    status: "delivered",
    date: new Date("2023-05-13T08:45:00"),
    address: "303 Cedar Ln, Somewhere, IL 97531",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-7646",
    customer: "Robert Martinez",
    email: "rmartinez@example.com",
    products: ["Bookshelf", "Desk Lamp"],
    total: 399.99,
    status: "shipped",
    date: new Date("2023-05-12T13:15:00"),
    address: "404 Birch Dr, Elsewhere, OH 86420",
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-7645",
    customer: "Lisa Thompson",
    email: "lisa.t@example.com",
    products: ["Nightstand", "Queen Size Bed Frame"],
    total: 1499.98,
    status: "processing",
    date: new Date("2023-05-12T15:00:00"),
    address: "505 Walnut Ave, Nowhere, MI 75319",
    paymentMethod: "Credit Card",
  },
];

// Get status badge for order
const getStatusBadge = (status: string) => {
  switch (status) {
    case "delivered":
      return (
        <Badge className="border-0 bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Delivered
        </Badge>
      );
    case "processing":
      return (
        <Badge className="border-0 bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="mr-1 h-3.5 w-3.5" />
          Processing
        </Badge>
      );
    case "shipped":
      return (
        <Badge className="border-0 bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
          <TruckIcon className="mr-1 h-3.5 w-3.5" />
          Shipped
        </Badge>
      );
    case "pending":
      return (
        <Badge className="border-0 bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Package className="mr-1 h-3.5 w-3.5" />
          Pending
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="border-0 bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="mr-1 h-3.5 w-3.5" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter orders based on search query and status filter
  const filteredOrders = ORDERS_DATA.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-4 p-6 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.customer}</span>
                      <span className="text-muted-foreground text-xs">
                        {order.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(order.date, "MMM d, yyyy")}</span>
                      <span className="text-muted-foreground text-xs">
                        {format(order.date, "h:mm a")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Clock className="mr-2 h-4 w-4" />
                            Change status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem>
                                <Package className="mr-2 h-4 w-4" />
                                Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="mr-2 h-4 w-4" />
                                Processing
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <TruckIcon className="mr-2 h-4 w-4" />
                                Shipped
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Delivered
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelled
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-3">
          <div className="text-muted-foreground text-sm">
            Showing <strong>{filteredOrders.length}</strong> of{" "}
            <strong>{ORDERS_DATA.length}</strong> orders
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
