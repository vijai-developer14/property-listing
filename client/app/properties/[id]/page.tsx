import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PropertyGallery from "@/components/PropertyGallery";
import ContactOwnerButton from "@/components/ContactOwnerButton";

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
  property_type: string;
  property_approval: string;
};

async function getProperty(id: string): Promise<Property | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}`, {
    next: { revalidate: 60 }, 
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.property;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return { title: "Property Not Found" };
  }

  return {
    title: `${property.property_name} — ${property.city} | Property Listing`,
    description: `${property.property_bhk} BHK ${property.property_type} in ${property.location}, ${property.city}. ${property.property_size} sq ft.`,
    openGraph: {
      title: property.property_name,
      description: `${property.property_bhk} BHK in ${property.city}`,
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PropertyGallery propertyId={property.id} alt={property.property_name} />

      <div className="mt-6">
        <h1 className="text-2xl font-bold text-gray-900">{property.property_name}</h1>
        <p className="text-gray-500 mt-1">
          {property.location}, {property.city}
        </p>

        <p className="text-2xl font-bold text-green-600 mt-3">
          {formatPrice(property.property_price)}
        </p>

        <div className="flex gap-4 mt-4 text-sm text-gray-600">
          <span>{property.property_bhk} BHK</span>
          <span>·</span>
          <span>{property.property_size} sq ft</span>
          <span>·</span>
          <span>{property.property_type}</span>
        </div>

        {property.property_approval && (
          <p className="text-sm text-gray-500 mt-2">
            Approval: {property.property_approval}
          </p>
        )}

        <div className="mt-6">
          <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-600">{property.description || "No description provided."}</p>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-gray-900 mb-2">Address</h2>
          <p className="text-gray-600">{property.address_line}</p>
        </div>

        <div className="mt-6 max-w-sm">
          <ContactOwnerButton propertyId={property.id} />
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}