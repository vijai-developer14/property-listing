"use client";

import { useEffect, useState } from "react";
import PropertyForm from "./PropertyForm";
import PropertyCard from "./PropertyCard";

type Property = {
  id: number;
  property_name: string;
  address_line: string;
  location: string;
  city: string;
  property_size: number;
  property_price: number;
  description: string;
  property_bhk: number;
  property_type_id: number;
};

export default function DashboardClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProperties = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/mine`, {
      credentials: "include",
    });
    const data = await res.json();
    setProperties(data.properties || []);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this property?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchProperties();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProperty(null);
    fetchProperties();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Properties</h1>
        <button
          onClick={() => { setEditingProperty(null); setShowForm(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Property
        </button>
      </div>

      {showForm && (
        <div className="mb-6 border border-gray-200 rounded-lg p-4">
          <PropertyForm
            propertyId={editingProperty?.id}
            initialData={editingProperty ? {
                property_name: editingProperty.property_name,
                address_line: editingProperty.address_line,
                location: editingProperty.location,
                city: editingProperty.city,
                property_size: String(editingProperty.property_size),
                property_price: String(editingProperty.property_price),
                description: editingProperty.description,
                property_bhk: String(editingProperty.property_bhk),
                property_type_id: String(editingProperty.property_type_id),
            } : 
            undefined}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      <div className="space-y-3">
        {properties.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            onEdit={(prop) => { setEditingProperty(prop as Property); setShowForm(true); }}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}