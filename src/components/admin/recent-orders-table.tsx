"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  TruckIcon,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Demo data
const RECENT_ORDERS = [
  {
    id: "ORD-7652",
    customer: "John Smith",
    product: "Modern Sofa (Gray)",
    total: "$1,299.99",
    status: "delivered",
    date: "2 hours ago",
  },
  {
    id: "ORD-7651",
    customer: "Sarah Johnson",
    product: "Modern Coffee Table",
    total: "$249.99",
    status: "processing",
    date: "5 hours ago",
  },
  {
    id: "ORD-7650",
    customer: "Michael Brown",
    product: "Modern Sectional Sofa",
    total: "$2,399.99",
    status: "shipped",
    date: "1 day ago",
  },
  {
    id: "ORD-7649",
    customer: "Emma Wilson",
    product: "Leather Recliner",
    total: "$899.99",
    status: "pending",
    date: "1 day ago",
  },
  {
    id: "ORD-7648",
    customer: "David Lee",
    product: "Accent Chair",
    total: "$349.99",
    status: "cancelled",
    date: "2 days ago",
  },
];

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

export default function RecentOrdersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {RECENT_ORDERS.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span className="font-medium">{order.id}</span>
                <span className="text-muted-foreground text-xs">
                  {order.date}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{order.customer}</span>
                <span className="text-muted-foreground max-w-[150px] truncate text-xs">
                  {order.product}
                </span>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(order.status)}</TableCell>
            <TableCell>{order.total}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:bg-muted flex h-8 w-8 items-center justify-center rounded-md p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/orders/${order.id}`}>View details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Update status</DropdownMenuItem>
                  <DropdownMenuItem>Contact customer</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
