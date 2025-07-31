"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Demo data for customers
const CUSTOMERS_DATA = [
  {
    id: "CUST-001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    orders: 12,
    totalSpent: 5640.5,
    status: "Active",
    joinedDate: "2023-01-15",
    avatar: "https://placehold.co/100x100?text=JS",
  },
  {
    id: "CUST-002",
    name: "Emma Johnson",
    email: "emma.johnson@example.com",
    phone: "+1 (555) 234-5678",
    location: "Los Angeles, CA",
    orders: 8,
    totalSpent: 3200.75,
    status: "Active",
    joinedDate: "2023-02-20",
    avatar: "https://placehold.co/100x100?text=EJ",
  },
  {
    id: "CUST-003",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+1 (555) 345-6789",
    location: "Chicago, IL",
    orders: 5,
    totalSpent: 1850.25,
    status: "Active",
    joinedDate: "2023-03-10",
    avatar: "https://placehold.co/100x100?text=MB",
  },
  {
    id: "CUST-004",
    name: "Sophia Williams",
    email: "sophia.williams@example.com",
    phone: "+1 (555) 456-7890",
    location: "Houston, TX",
    orders: 3,
    totalSpent: 980.3,
    status: "Inactive",
    joinedDate: "2023-04-05",
    avatar: "https://placehold.co/100x100?text=SW",
  },
  {
    id: "CUST-005",
    name: "James Davis",
    email: "james.davis@example.com",
    phone: "+1 (555) 567-8901",
    location: "Philadelphia, PA",
    orders: 0,
    totalSpent: 0.0,
    status: "Inactive",
    joinedDate: "2023-05-15",
    avatar: "https://placehold.co/100x100?text=JD",
  },
  {
    id: "CUST-006",
    name: "Olivia Miller",
    email: "olivia.miller@example.com",
    phone: "+1 (555) 678-9012",
    location: "Phoenix, AZ",
    orders: 6,
    totalSpent: 2100.45,
    status: "Active",
    joinedDate: "2023-06-20",
    avatar: "https://placehold.co/100x100?text=OM",
  },
  {
    id: "CUST-007",
    name: "William Wilson",
    email: "william.wilson@example.com",
    phone: "+1 (555) 789-0123",
    location: "San Diego, CA",
    orders: 10,
    totalSpent: 4200.9,
    status: "Active",
    joinedDate: "2023-07-10",
    avatar: "https://placehold.co/100x100?text=WW",
  },
  {
    id: "CUST-008",
    name: "Ava Moore",
    email: "ava.moore@example.com",
    phone: "+1 (555) 890-1234",
    location: "Dallas, TX",
    orders: 7,
    totalSpent: 2650.35,
    status: "Active",
    joinedDate: "2023-08-05",
    avatar: "https://placehold.co/100x100?text=AM",
  },
];

// Get status badge for customer
const getStatusBadge = (status: string) => {
  if (status === "Inactive") {
    return <Badge variant="secondary">Inactive</Badge>;
  } else {
    return (
      <Badge
        variant="default"
        className="border-0 bg-green-100 text-green-800 hover:bg-green-100"
      >
        Active
      </Badge>
    );
  }
};

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter customers based on search query
  const filteredCustomers = CUSTOMERS_DATA.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-6 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="h-10 w-10 rounded-full border object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {customer.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-3 w-3" />
                        {customer.email}
                      </div>
                      <div className="mt-1 flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
                      {customer.location}
                    </div>
                  </TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
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
                          <Mail className="mr-2 h-4 w-4" />
                          Send email
                        </DropdownMenuItem>
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
            Showing <strong>{filteredCustomers.length}</strong> of{" "}
            <strong>{CUSTOMERS_DATA.length}</strong> customers
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
