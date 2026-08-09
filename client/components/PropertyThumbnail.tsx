"use client";

import { useState, useEffect } from "react";

type PropertyThumbnailProps = {
  propertyId: number;
  alt: string;
};

export default function PropertyThumbnail({ propertyId, alt }: PropertyThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/property-images/${propertyId}`)
      .then((res) => res.json())
      .then((data) => {
        const primary = data.images?.find((img: any) => img.is_primary) || data.images?.[0];
        setImageUrl(primary?.image_url || null);
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

    if (loading) {
    return <div className="w-full h-44 bg-neutral-800 animate-pulse" />;
    }

    if (!imageUrl) {
    return (
        <div className="w-full h-44 bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm">
        No photo
        </div>
    );
    }

    return (
    <img
        src={imageUrl}
        alt={alt}
        className="w-full h-44 object-cover"
    />
    );
}