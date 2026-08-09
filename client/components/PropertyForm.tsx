"use client";

import { useState, useEffect } from "react";

type PropertyFormData = {
  property_name: string;
  address_line: string;
  location: string;
  city: string;
  property_size: string;
  property_price: string;
  description: string;
  property_bhk: string;
  property_type_id: string;
};

type PropertyFormProps = {
  initialData?: Partial<PropertyFormData>;
  propertyId?: number;
  onSuccess: () => void;
};

const emptyForm: PropertyFormData = {
  property_name: "",
  address_line: "",
  location: "",
  city: "",
  property_size: "",
  property_price: "",
  description: "",
  property_bhk: "",
  property_type_id: "",
};

export default function PropertyForm({ initialData, propertyId, onSuccess }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({ ...emptyForm, ...initialData });
  const [propertyTypes, setPropertyTypes] = useState<{ id: number; property_type: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = Boolean(propertyId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/properties`;

      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/property-types`)
        .then((res) => res.json())
        .then((data) => setPropertyTypes(data.propertyTypes || []));
    }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <input
        name="property_name"
        required
        value={formData.property_name}
        onChange={handleChange}
        placeholder="Property Name"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <input
        name="city"
        required
        value={formData.city}
        onChange={handleChange}
        placeholder="City"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <input
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Locality / Neighbourhood"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <input
        name="address_line"
        value={formData.address_line}
        onChange={handleChange}
        placeholder="Address"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <input
        name="property_price"
        type="number"
        required
        value={formData.property_price}
        onChange={handleChange}
        placeholder="Price"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <input
        name="property_size"
        type="number"
        value={formData.property_size}
        onChange={handleChange}
        placeholder="Size (sq ft)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <select
        name="property_bhk"
        required
        value={formData.property_bhk}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
        <option value="">Select BHK</option>
        <option value="1">1 BHK</option>
        <option value="2">2 BHK</option>
        <option value="3">3 BHK</option>
        <option value="4">4+ BHK</option>
        </select>

        <select
        name="property_type_id"
        required
        value={formData.property_type_id}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
        <option value="">Select Property Type</option>
        {propertyTypes.map((type) => (
            <option key={type.id} value={type.id}>
            {type.property_type}
            </option>
        ))}
        </select>
      
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        rows={4}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold disabled:opacity-60"
      >
        {loading ? "Saving..." : isEditMode ? "Update Property" : "Create Property"}
      </button>
    </form>
  );
}