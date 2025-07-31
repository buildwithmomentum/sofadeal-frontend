"use client";

import { useState, useEffect, useCallback } from "react";
import ProductImageUpload from "./product-image-upload";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  type: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface ProductImageManagerProps {
  productId: string;
  apiUrl?: string;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23888888'%3EImage not found%3C/text%3E%3C/svg%3E";

export default function ProductImageManager({
  productId,
  apiUrl = "https://sopa-deal-production.up.railway.app/products/admin/products",
}: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/${productId}/images`);

      if (!response.ok) {
        throw new Error("Failed to fetch product images");
      }

      const data = await response.json();
      setImages(data);
    } catch (error) {
      toast.error("Error fetching images");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, productId]);

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId, apiUrl, fetchImages]);

  const handleImageUploadSuccess = (data: {
    id: string;
    url: string;
    type: string;
    order: number;
  }) => {
    // Convert the simplified data to a full ProductImage object
    const newImage: ProductImage = {
      id: data.id,
      product_id: productId,
      variant_id: null,
      url: data.url,
      type: data.type,
      order: data.order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setImages((prev) => [...prev, newImage]);
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`${apiUrl}/${productId}/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      // Remove image from state
      setImages((prev) => prev.filter((image) => image.id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Error deleting image");
      console.error(error);
    }
  };

  // Group images by type
  const mainImages = images.filter((img) => img.type === "main");
  const galleryImages = images.filter((img) => img.type === "gallery");
  const images360 = images.filter((img) => img.type === "360");

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="mb-8">
        <ProductImageUpload
          productId={productId}
          onSuccess={handleImageUploadSuccess}
          apiUrl={apiUrl}
        />
      </div>

      {/* Current Images Section */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Current Images</h2>

        {isLoading ? (
          <div className="py-8 text-center">Loading images...</div>
        ) : images.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            No images uploaded yet
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Images */}
            {mainImages.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-medium">Main Images</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {mainImages.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      onDelete={handleDeleteImage}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Images */}
            {galleryImages.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-medium">Gallery Images</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {galleryImages.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      onDelete={handleDeleteImage}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 360 Images */}
            {images360.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-medium">360° View Images</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {images360.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      onDelete={handleDeleteImage}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ImageCardProps {
  image: ProductImage;
  onDelete: (id: string) => void;
}

function ImageCard({ image, onDelete }: ImageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this image?")) {
      setIsDeleting(true);
      try {
        await onDelete(image.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-md border">
      <img
        src={image.url}
        alt={`Product image ${image.id}`}
        className="aspect-square w-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = PLACEHOLDER_IMAGE;
        }}
      />

      <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20"></div>

      <div className="absolute right-2 bottom-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="absolute top-2 left-2">
        <span className="rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-black">
          Order: {image.order || 0}
        </span>
      </div>
    </div>
  );
}
