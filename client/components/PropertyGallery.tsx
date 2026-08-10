"use client";

import { useState, useEffect } from "react";

type PropertyGalleryProps = {
  propertyId: number;
  alt: string;
};

export default function PropertyGallery({ propertyId, alt }: PropertyGalleryProps) {
  const [images, setImages] = useState<{ id: number; image_url: string; is_primary: boolean }[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/property-images/${propertyId}`)
      .then((res) => res.json())
      .then((data) => setImages(data.images || []));
  }, [propertyId]);

  if (images.length === 0) {
    return <div className="w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">No photos</div>;
  }

  return (
    <div>
      <img
        src={images[activeIndex].image_url}
        alt={alt}
        className="w-full h-80 object-cover rounded-xl"
      />
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {images.map((img, i) => (
            <img
              key={img.id}
              src={img.image_url}
              alt={alt}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 object-cover rounded-lg cursor-pointer shrink-0 ${
                i === activeIndex ? "ring-2 ring-green-500" : "opacity-60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}