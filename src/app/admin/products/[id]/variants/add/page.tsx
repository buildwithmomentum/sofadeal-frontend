"use client";

import React from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useProduct } from "@/hooks/use-products";
import { useCreateProductVariant } from "@/hooks/use-products";

const variantFormSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
});

type FormValues = z.infer<typeof variantFormSchema>;

export default function AddVariantPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading: isProductLoading } = useProduct(productId);
  const createVariantMutation = useCreateProductVariant(productId);

  const form = useForm<FormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      sku: "",
      price: product?.base_price || 0,
      color: "",
      size: "",
      stock: 0,
    },
  });

  // Update price field with product base price when product data loads
  React.useEffect(() => {
    if (product) {
      form.setValue("price", product.base_price);
    }
  }, [product, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await createVariantMutation.mutateAsync({
        sku: values.sku,
        price: values.price,
        color: values.color || undefined,
        size: values.size || undefined,
        stock: values.stock,
      });

      // Navigate back to the product detail page
      router.push(`/admin/products/${productId}`);
      router.refresh();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Error in variant creation flow:", error);
    }
  };

  if (isProductLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/products/${productId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add Product Variant</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (Stock Keeping Unit) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter unique SKU" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique identifier for this product variant
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
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
                        The price of this variant in GBP
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Red, Blue, Green"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The color of this variant (if applicable)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Small, Medium, Large"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The size of this variant (if applicable)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of items in stock for this variant
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Link href={`/admin/products/${productId}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={createVariantMutation.isPending}
                >
                  {createVariantMutation.isPending
                    ? "Adding..."
                    : "Add Variant"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
