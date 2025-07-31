"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Trash2, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Form schema using zod for validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Product name must be at least 3 characters.",
  }),
  sku: z.string().min(3, {
    message: "SKU must be at least 3 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  originalPrice: z.coerce
    .number()
    .positive({
      message: "Original price must be a positive number.",
    })
    .optional(),
  stock: z.coerce.number().nonnegative({
    message: "Stock must be a non-negative number.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string()).optional(),
  status: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Product categories
const PRODUCT_CATEGORIES = [
  "Sofas",
  "Chairs",
  "Tables",
  "Beds",
  "Storage",
  "Dining",
  "Bedroom",
  "Living Room",
  "Office",
  "Outdoor",
];

// Product sizes options
const PRODUCT_SIZES = [
  "Single",
  "Double",
  "King",
  "Super King", // Bed sizes
  "Small",
  "Medium",
  "Large",
  "Extra Large", // General sizes
  "Standard",
  "Oversized", // Chair sizes
  "1-Seater",
  "2-Seater",
  "3-Seater",
  "4-Seater", // Sofa sizes
];

// Product color options
const PRODUCT_COLORS = [
  "Black",
  "White",
  "Gray",
  "Silver",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Brown",
  "Beige",
  "Navy Blue",
  "Teal",
  "Mustard",
  "Walnut",
  "Oak",
  "Tan",
];

// Demo data for products (same as in products page)
const PRODUCTS_DATA = [
  {
    id: "PROD-001",
    name: "Modern Sectional Sofa",
    category: "Sofas",
    price: 2399.99,
    originalPrice: 2999.99,
    stock: 12,
    status: "Active",
    image: "https://placehold.co/100x100?text=Sofa",
    images: [
      "https://placehold.co/300x300?text=Sofa+View+1",
      "https://placehold.co/300x300?text=Sofa+View+2",
    ],
    description:
      "A luxurious modern sectional sofa perfect for your living room. Features plush cushions and premium upholstery.",
    dimensions: '120" x 80" x 36"',
    material: "Fabric, Wood",
    colors: ["Gray", "Beige", "Navy Blue"],
    sizes: ["Single", "Double", "King", "Super King"],
    features: [
      "Premium memory foam adapts to your body shape",
      "Breathable fabric keeps you cool all night",
      "Hypoallergenic materials suitable for sensitive skin",
      "No-flip design for easy maintenance",
      "10-year manufacturer warranty",
    ],
    specifications: {
      material: "Memory Foam with Pocket Springs",
      height: "25cm (10 inches)",
      firmness: "Medium Firm",
      cover: "Quilted Knitted Fabric",
      care: "Spot clean only, rotate regularly",
    },
    createdAt: "2023-01-15",
    sku: "SOF-MS-001",
  },
  {
    id: "PROD-002",
    name: "Leather Recliner",
    category: "Chairs",
    price: 899.99,
    stock: 8,
    status: "Active",
    image: "https://placehold.co/100x100?text=Chair",
    description:
      "A comfortable leather recliner with power controls. Perfect for your living room or entertainment space.",
    dimensions: '36" x 40" x 42"',
    material: "Leather, Wood, Metal",
    colors: ["Brown", "Black", "Tan"],
    createdAt: "2023-02-20",
    sku: "CHR-LR-002",
  },
  {
    id: "PROD-003",
    name: "Modern Coffee Table",
    category: "Tables",
    price: 249.99,
    stock: 15,
    status: "Active",
    image: "https://placehold.co/100x100?text=Table",
    description:
      "A sleek modern coffee table with tempered glass top and wooden base.",
    dimensions: '48" x 24" x 18"',
    material: "Glass, Wood",
    colors: ["Walnut", "Oak", "Black"],
    createdAt: "2023-03-10",
    sku: "TBL-CT-003",
  },
  {
    id: "PROD-004",
    name: "Accent Chair",
    category: "Chairs",
    price: 349.99,
    stock: 6,
    status: "Low Stock",
    image: "https://placehold.co/100x100?text=Chair",
    description:
      "A stylish accent chair with unique design. Perfect addition to any room.",
    dimensions: '28" x 32" x 34"',
    material: "Fabric, Wood",
    colors: ["Teal", "Mustard", "Gray"],
    createdAt: "2023-02-28",
    sku: "CHR-AC-004",
  },
  {
    id: "PROD-005",
    name: "Queen Size Bed Frame",
    category: "Beds",
    price: 1299.99,
    stock: 0,
    status: "Out of Stock",
    image: "https://placehold.co/100x100?text=Bed",
    description:
      "A modern queen size bed frame with headboard and storage drawers.",
    dimensions: '60" x 80" x 45"',
    material: "Wood, Metal",
    colors: ["Walnut", "White", "Gray"],
    createdAt: "2023-01-05",
    sku: "BED-QS-005",
  },
];

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<(typeof PRODUCTS_DATA)[0] | null>(
    null
  );

  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      price: 0,
      originalPrice: undefined,
      stock: 0,
      description: "",
      dimensions: undefined,
      material: undefined,
      imageUrl: undefined,
      images: undefined,
      colors: undefined,
      sizes: undefined,
      features: undefined,
      specifications: undefined,
      status: undefined,
    },
  });

  // Helper functions to add/remove dynamic fields
  const addFeature = () => {
    const currentFeatures = form.getValues("features") || [];
    form.setValue("features", [...currentFeatures, ""]);
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("features") || [];
    form.setValue(
      "features",
      currentFeatures.filter((_, i) => i !== index)
    );
  };

  // Modified specification handling with inline form
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const addSpecification = () => {
    if (newSpecKey.trim()) {
      const currentSpecs = form.getValues("specifications") || {};
      form.setValue("specifications", {
        ...currentSpecs,
        [newSpecKey.trim()]: newSpecValue.trim(),
      });
      // Reset the form fields
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    const currentSpecs = form.getValues("specifications") || {};
    const newSpecs = { ...currentSpecs };
    delete newSpecs[key];
    form.setValue("specifications", newSpecs);
  };

  // File upload handling
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isMainImage = false
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real application, you would upload the file to a server/cloud storage
    // Here we're creating a local object URL for demo purposes
    const imageUrl = URL.createObjectURL(file);

    if (isMainImage) {
      form.setValue("imageUrl", imageUrl);
    } else {
      const currentImages = form.getValues("images") || [];
      form.setValue("images", [...currentImages, imageUrl]);
    }

    // Reset the file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleAdditionalFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Handle multiple files
    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );

    const currentImages = form.getValues("images") || [];
    form.setValue("images", [...currentImages, ...newImages]);

    // Reset the file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    form.setValue(
      "images",
      currentImages.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    // Find product with the matching ID
    const foundProduct = PRODUCTS_DATA.find((p) => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);

      // Set form values with product data
      form.reset({
        name: foundProduct.name,
        sku: foundProduct.sku,
        category: foundProduct.category,
        price: foundProduct.price,
        originalPrice: foundProduct.originalPrice || undefined,
        stock: foundProduct.stock,
        description: foundProduct.description,
        dimensions: foundProduct.dimensions || undefined,
        material: foundProduct.material || undefined,
        imageUrl: foundProduct.image || undefined,
        images: foundProduct.images || undefined,
        colors: foundProduct.colors || undefined,
        sizes: foundProduct.sizes || undefined,
        features: foundProduct.features || undefined,
        specifications: foundProduct.specifications || undefined,
        status: foundProduct.status || undefined,
      });
    } else {
      // If no product is found, redirect back to products list
      toast.error("Product not found");
      router.push("/admin/products");
    }
  }, [id, router, form]);

  // Form submission handler
  function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log(values);
      toast.success("Product updated successfully!");
      setIsSubmitting(false);
      router.push(`/admin/products/${id}`);
    }, 1000);
  }

  if (!product) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-6 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/admin/products/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Edit product details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Modern Sofa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="SOF-MS-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave same as price if no discount
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a detailed product description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dimensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimensions</FormLabel>
                        <FormControl>
                          <Input placeholder='60" x 80" x 45"' {...field} />
                        </FormControl>
                        <FormDescription>
                          Format: Width x Depth x Height
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
                        <FormLabel>Materials</FormLabel>
                        <FormControl>
                          <Input placeholder="Wood, Fabric, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Update product images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="w-full">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Main Image</FormLabel>
                          <div className="mb-4 flex flex-col items-center gap-4 md:flex-row">
                            <div className="relative aspect-square w-full overflow-hidden rounded-lg border md:w-1/3">
                              <img
                                src={
                                  field.value ||
                                  "https://placehold.co/300x300?text=Product+Image"
                                }
                                alt="Product"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="w-full md:w-2/3">
                              {/* Hidden file input */}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => handleFileUpload(e, true)}
                              />
                              <div className="flex w-full gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Image
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() =>
                                    form.setValue(
                                      "imageUrl",
                                      "https://placehold.co/300x300?text=Product+Image"
                                    )
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Clear
                                </Button>
                              </div>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-full">
                    <FormLabel>Additional Images</FormLabel>
                    <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {(form.watch("images") || []).map((imageUrl, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-2 rounded-lg border p-3"
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                            <img
                              src={imageUrl}
                              alt={`Product view ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Hidden file input for multiple files */}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="multi-file-upload-edit"
                      onChange={handleAdditionalFileUpload}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document
                          .getElementById("multi-file-upload-edit")
                          ?.click()
                      }
                      className="mt-4 w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Images
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Product
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="colors"
              render={() => (
                <FormItem>
                  <FormLabel>Available Colors</FormLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRODUCT_COLORS.map((color) => (
                      <div key={color} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`color-${color}`}
                          checked={(form.watch("colors") || []).includes(color)}
                          onChange={(e) => {
                            const current = form.watch("colors") || [];
                            if (e.target.checked) {
                              form.setValue("colors", [...current, color]);
                            } else {
                              form.setValue(
                                "colors",
                                current.filter((c) => c !== color)
                              );
                            }
                          }}
                          className="mr-1"
                        />
                        <label htmlFor={`color-${color}`} className="text-sm">
                          {color}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sizes"
              render={() => (
                <FormItem>
                  <FormLabel>Available Sizes</FormLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRODUCT_SIZES.map((size) => (
                      <div key={size} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`size-${size}`}
                          checked={(form.watch("sizes") || []).includes(size)}
                          onChange={(e) => {
                            const current = form.watch("sizes") || [];
                            if (e.target.checked) {
                              form.setValue("sizes", [...current, size]);
                            } else {
                              form.setValue(
                                "sizes",
                                current.filter((s) => s !== size)
                              );
                            }
                          }}
                          className="mr-1"
                        />
                        <label htmlFor={`size-${size}`} className="text-sm">
                          {size}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div>
            <FormLabel>Product Features</FormLabel>
            <div className="mt-2 space-y-2">
              {(form.watch("features") || []).map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => {
                      const currentFeatures = [
                        ...(form.watch("features") || []),
                      ];
                      currentFeatures[index] = e.target.value;
                      form.setValue("features", currentFeatures);
                    }}
                    placeholder="Enter a product feature"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeFeature(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Feature
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <FormLabel>Specifications</FormLabel>
            <div className="mt-2 space-y-2">
              {Object.entries(form.watch("specifications") || {}).map(
                ([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-2">
                    <div className="font-medium capitalize">{key}:</div>
                    <div className="flex gap-2">
                      <Input
                        value={value as string}
                        onChange={(e) => {
                          const currentSpecs = {
                            ...(form.watch("specifications") || {}),
                          };
                          currentSpecs[key] = e.target.value;
                          form.setValue("specifications", currentSpecs);
                        }}
                        placeholder={`Enter ${key}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSpecification(key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Specification name"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Specification value"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addSpecification}
                    disabled={!newSpecKey.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
