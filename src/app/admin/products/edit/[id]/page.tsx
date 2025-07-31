"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";

const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  base_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  // Use React Query hooks
  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
    error: productError,
  } = useProduct(productId, {
    includeImages: true,
    includeCategory: true,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories(false);

  const updateProductMutation = useUpdateProduct(productId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      base_price: 0,
    },
  });

  // When product data is loaded, update the form
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        category_id: product.category_id || "",
        base_price: product.base_price,
      });
    }
  }, [product, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Format the data for the API
      const productData = {
        name: values.name,
        description: values.description || undefined,
        category_id: values.category_id || undefined,
        base_price: values.base_price,
      };

      // Use the mutation
      await updateProductMutation.mutateAsync(productData);

      // Redirect to products list
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      // Error is already handled in the mutation hook
      console.error("Error in product update flow:", error);
    }
  };

  // Show loading state
  if (isProductLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  // Show error state
  if (isProductError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="text-red-500">
          Error loading product:{" "}
          {productError instanceof Error
            ? productError.message
            : "Unknown error"}
        </p>
        <Button onClick={() => router.push("/admin/products")}>
          Return to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The base price of the product in GBP.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!isCategoriesLoading &&
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the product category.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description"
                        className="min-h-32 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description of the product.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {product?.variants && product.variants.length > 0 && (
                <div className="mt-4 rounded-md border p-4">
                  <h3 className="mb-2 font-medium">Product Variants</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    This product has {product.variants.length} variants. Manage
                    variants through the product details page.
                  </p>
                  <Link href={`/admin/products/${productId}`}>
                    <Button type="button" variant="outline" size="sm">
                      View All Variants
                    </Button>
                  </Link>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Link href="/admin/products">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                >
                  {updateProductMutation.isPending
                    ? "Saving..."
                    : "Update Product"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
