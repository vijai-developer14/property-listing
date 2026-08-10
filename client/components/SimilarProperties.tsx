"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PropertyThumbnail from "./PropertyThumbnail";

type SimilarProperty = {
  id: number;
  property_name: string;
  city: string;
  property_price: number;
  property_bhk: number;
};

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function SimilarProperties({ propertyId }: { propertyId: number }) {
  const [properties, setProperties] = useState<SimilarProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}/similar`)
      .then((res) => res.json())
      .then((data) => setProperties(data.properties || []))
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading || properties.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Similar Properties</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {properties.map((p) => (
          <Link
            key={p.id}
            href={`/properties/${p.id}`}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-green-500 transition-all block"
          >
            <PropertyThumbnail propertyId={p.id} alt={p.property_name} />
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm truncate">{p.property_name}</h3>
              <p className="text-xs text-gray-500 mt-1">{p.city} · {p.property_bhk} BHK</p>
              <p className="text-sm font-bold text-green-600 mt-1">{formatPrice(p.property_price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}