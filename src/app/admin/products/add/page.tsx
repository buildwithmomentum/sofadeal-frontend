"use client";
import { useRouter } from "next/navigation";
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
import { useCreateProduct } from "@/hooks/use-products";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Define a simpler schema to avoid TypeScript issues
const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  base_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  default_color: z.string().optional(),
  default_size: z.string().optional(),
  initial_stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .optional(),
  default_sku: z.string().optional(),
  tags: z.string().optional(),
  material: z.string().optional(),
  brand: z.string().optional(),
  featured: z.boolean().optional(),
});

export default function AddProductPage() {
  const router = useRouter();

  // Use auth hook to ensure we have a valid session
  const {
    isAuthenticated,
    loading: authLoading,
    getToken,
  } = useAuth({
    redirectTo: "/login",
    requireAuth: true,
  });

  // Use React Query hooks
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories(false);
  const createProductMutation = useCreateProduct();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      base_price: 0,
      default_color: "",
      default_size: "",
      initial_stock: 0,
      default_sku: "",
      tags: "",
      material: "",
      brand: "",
      featured: false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Check if we're authenticated before proceeding
      if (!isAuthenticated) {
        toast.error("Please log in to create a product");
        router.push("/login");
        return;
      }

      // Get a fresh token before making the request
      const token = await getToken();
      if (!token) {
        toast.error("Authentication token not available");
        return;
      }

      // Format the data for the API
      const productData = {
        name: values.name,
        description: values.description || undefined,
        category_id: values.category_id || undefined,
        base_price: Number(values.base_price),
        default_color: values.default_color || undefined,
        default_size: values.default_size || undefined,
        initial_stock: Number(values.initial_stock) || 0,
        default_sku: values.default_sku || undefined,
        tags: values.tags || undefined,
        material: values.material || undefined,
        brand: values.brand || undefined,
        featured: Boolean(values.featured),
      };

      // Use the mutation
      await createProductMutation.mutateAsync(productData);

      // Redirect to products list
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error in product creation flow:", error);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Loading...</p>
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
        <h1 className="text-3xl font-bold">Add New Product</h1>
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
                          {!isLoadingCategories &&
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

                <FormField
                  control={form.control}
                  name="default_sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Product SKU" {...field} />
                      </FormControl>
                      <FormDescription>
                        Stock Keeping Unit (optional, will be auto-generated if
                        not provided).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Default color" {...field} />
                      </FormControl>
                      <FormDescription>
                        The default color for the initial variant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Size</FormLabel>
                      <FormControl>
                        <Input placeholder="Default size" {...field} />
                      </FormControl>
                      <FormDescription>
                        The default size for the initial variant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initial_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The initial stock quantity for the default variant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. modern,comfortable,living room"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags for the variant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Premium Fabric" {...field} />
                      </FormControl>
                      <FormDescription>
                        Material for the variant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SofaDeal" {...field} />
                      </FormControl>
                      <FormDescription>Brand for the variant.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Whether this variant should be featured.
                        </FormDescription>
                      </div>
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

              <div className="flex justify-end gap-4">
                <Link href="/admin/products">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending
                    ? "Creating..."
                    : "Create Product"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
