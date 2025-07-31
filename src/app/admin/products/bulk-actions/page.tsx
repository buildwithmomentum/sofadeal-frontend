"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Tag,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

// Mock function for bulk deleting products
const bulkDeleteProducts = async (productIds: string[]) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true, deleted: productIds.length };
};

// Mock function for bulk updating products
const bulkUpdateProducts = async (productIds: string[]) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true, updated: productIds.length };
};

type ProductsResponse = {
  items: {
    id: string;
    name: string;
    description: string;
    base_price: number;
    category_id: string;
    category?: { name: string };
    created_at: string;
    images?: { url: string }[];
  }[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

const bulkUpdateFormSchema = z.object({
  category_id: z.string().optional(),
  base_price_action: z.enum(["", "set", "increase", "decrease"]).optional(),
  base_price_value: z
    .number()
    .min(0, "Value must be positive")
    .optional()
    .nullable(),
  base_price_percentage: z
    .number()
    .min(0, "Percentage must be positive")
    .max(100, "Percentage cannot exceed 100%")
    .optional()
    .nullable(),
});

export default function BulkActionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: categoriesData } = useCategories();
  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useProducts({
    page,
    limit,
    search: search || undefined,
    includeImages: true,
    includeCategory: true,
  }) as {
    data: ProductsResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  // Bulk update form
  const updateForm = useForm<z.infer<typeof bulkUpdateFormSchema>>({
    resolver: zodResolver(bulkUpdateFormSchema),
    defaultValues: {
      category_id: "",
      base_price_action: "",
      base_price_value: null,
      base_price_percentage: null,
    },
  });

  const handleSearch = () => {
    setPage(1); // Reset page when searching
    refetch();
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked && productsData) {
      setSelectedProductIds(productsData.items.map((product) => product.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds([...selectedProductIds, productId]);
    } else {
      setSelectedProductIds(
        selectedProductIds.filter((id) => id !== productId)
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) {
      toast.error("No products selected");
      return;
    }

    try {
      setIsProcessing(true);
      const result = await bulkDeleteProducts(selectedProductIds);
      if (result.success) {
        toast.success(`${result.deleted} products deleted successfully`);
        setSelectedProductIds([]);
        refetch();
      }
    } catch (error) {
      toast.error("Failed to delete products", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  const onUpdateSubmit = async (
    values: z.infer<typeof bulkUpdateFormSchema>
  ) => {
    if (selectedProductIds.length === 0) {
      toast.error("No products selected");
      return;
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (values.category_id) {
      updateData.category_id = values.category_id;
    }

    if (
      values.base_price_action &&
      (values.base_price_value !== null ||
        values.base_price_percentage !== null)
    ) {
      updateData.price_update = {
        action: values.base_price_action,
        value: values.base_price_value,
        percentage: values.base_price_percentage,
      };
    }

    if (Object.keys(updateData).length === 0) {
      toast.warning("No update fields provided");
      return;
    }

    try {
      setIsProcessing(true);
      const result = await bulkUpdateProducts(selectedProductIds);
      if (result.success) {
        toast.success(`${result.updated} products updated successfully`);
        // Reset form and selected products
        updateForm.reset();
        setSelectedProductIds([]);
        refetch();
      }
    } catch (error) {
      toast.error("Failed to update products", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
      setShowUpdateDialog(false);
    }
  };

  const products = productsData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Bulk Product Actions</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Products</CardTitle>
          <CardDescription>
            Select products to perform bulk actions
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>

          <div className="mb-4 flex items-center">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="ml-2 text-sm font-medium">
              Select All Products
            </label>
            {selectedProductIds.length > 0 && (
              <div className="text-muted-foreground ml-auto text-sm">
                {selectedProductIds.length} products selected
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <p className="text-red-500">Failed to load products</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={(checked) =>
                            handleSelectProduct(product.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-md">
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200 text-xs text-gray-500">
                            No img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {product.category ? product.category.name : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(product.base_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p>No products found</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>
          </div>
          <div className="space-x-2">
            <Button
              variant="default"
              onClick={() => setShowUpdateDialog(true)}
              disabled={selectedProductIds.length === 0}
            >
              <Tag className="mr-2 h-4 w-4" />
              Bulk Update
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={selectedProductIds.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Bulk Delete
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Products</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProductIds.length}{" "}
              products? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {selectedProductIds.length} Products
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Update Products</DialogTitle>
            <DialogDescription>
              Update information for {selectedProductIds.length} selected
              products
            </DialogDescription>
          </DialogHeader>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
              className="space-y-6"
            >
              <FormField
                control={updateForm.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No change" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No change</SelectItem>
                        {categoriesData?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Change the category for all selected products
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={updateForm.control}
                  name="base_price_action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Action</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="No change" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No change</SelectItem>
                          <SelectItem value="set">
                            Set to fixed value
                          </SelectItem>
                          <SelectItem value="increase">
                            Increase by amount/percentage
                          </SelectItem>
                          <SelectItem value="decrease">
                            Decrease by amount/percentage
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {updateForm.watch("base_price_action") === "set" && (
                  <FormField
                    control={updateForm.control}
                    name="base_price_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Price Value (£)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : null
                              )
                            }
                            value={field.value?.toString() || ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {(updateForm.watch("base_price_action") === "increase" ||
                  updateForm.watch("base_price_action") === "decrease") && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={updateForm.control}
                      name="base_price_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (£)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : null
                                )
                              }
                              value={field.value?.toString() || ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="base_price_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Percentage (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : null
                                )
                              }
                              value={field.value?.toString() || ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowUpdateDialog(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Update {selectedProductIds.length} Products
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
