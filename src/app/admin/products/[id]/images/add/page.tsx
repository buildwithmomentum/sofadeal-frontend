"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductImageUpload from "@/components/admin/product-image-upload";
import { toast } from "sonner";

export default function AddProductImagePage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const handleSuccess = () => {
    toast.success("Image added successfully");
    router.push(`/admin/products/${productId}`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/products/${productId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add Product Image</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Product Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImageUpload
            productId={productId}
            onSuccess={handleSuccess}
            apiUrl="https://sopa-deal-production.up.railway.app/products/admin/products"
          />
        </CardContent>
      </Card>
    </div>
  );
}
