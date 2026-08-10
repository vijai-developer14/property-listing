"use client";
import {useState, useEffect} from 'react'
import ImageUpload from "./ImageUpload";
type Property = {
  id: number;
  property_name: string;
  city: string;
  location: string;
  property_size: number;
  property_price: number;
  property_bhk: number;
  property_type_id: number;
  created_at: string;
};
type PropertyImage = {
  id: number;
  image_url: string;
  is_primary: boolean;
};
type PropertyCardProps = {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: number) => void;
};

export default function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
    const [showUpload, setShowUpload] = useState(false);
    const [images, setImages] = useState<PropertyImage[]>([]);

    const fetchImages = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/property-images/${property.id}`
      );
      const data = await res.json();
      setImages(data.images || []);
    };

    const handleDeleteImage = async (imageId: number) => {
      if (!confirm("Delete this photo?")) return;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/property-images/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      fetchImages();
    };

  useEffect(() => {
    fetchImages();
  }, [property.id]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
      {images.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {images.map((img) => (
            <div key={img.id} className="relative shrink-0">
              <img
                src={img.image_url}
                alt={property.property_name}
                className={`w-20 h-20 object-cover rounded-lg ${
                  img.is_primary ? "ring-2 ring-green-500" : ""
                }`}
              />
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-gray-800">{property.property_name}</h3>
        <p className="text-sm text-gray-500">{property.city} · {property.property_bhk} BHK · ₹{property.property_price}</p>
      </div>
      <div className="flex gap-2">
          <button onClick={() => setShowUpload(!showUpload)} className="text-green-600 text-sm font-medium hover:underline">
            {showUpload ? "Hide Photos" : "Add Photos"}
          </button>
        <button onClick={() => onEdit(property)} className="text-blue-600 text-sm font-medium hover:underline">
          Edit
        </button>
        <button onClick={() => onDelete(property.id)} className="text-red-600 text-sm font-medium hover:underline">
          Delete
        </button>
      </div>
            {showUpload && (
        <div className="mt-3">
          <ImageUpload
            propertyId={property.id}
            onSuccess={() => setShowUpload(false)}
          />
        </div>
      )}
    </div>
  );
}