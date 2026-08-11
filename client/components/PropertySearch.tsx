

"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import PropertyThumbnail from "./PropertyThumbnail";

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

type PropertyType = { id: number; property_type: string };

export default function PropertySearch() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [filters, setFilters] = useState({
    city: "",
    property_type_id: "",
    property_bhk: "",
    min_price: "",
    max_price: "",
    sort: "newest",
  });

  const fetchProperties = useCallback(async (targetPage: number, reset: boolean) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append("page", targetPage.toString());
      params.append("limit", "12");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/search?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setProperties((prev) => (reset ? data.properties || [] : [...prev, ...(data.properties || [])]));
        setHasMore(data.hasMore);
        setPage(targetPage);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/property-types`)
      .then((res) => res.json())
      .then((data) => setPropertyTypes(data.propertyTypes || []));
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    fetchProperties(1, true);
  }, [filters]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      credentials: "include",
    })
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProperties(page + 1, false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Find a Property</h1>

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">Property Listing</span>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-green-600 hover:underline"
          >
            + Add Property
          </Link>
          {!checkingAuth && (
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="text-sm font-medium text-gray-600 hover:underline"
            >
              {isLoggedIn ? "Admin Panel" : "Login / Sign Up"}
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <input
          name="city"
          value={filters.city}
          onChange={handleFilterChange}
          placeholder="City"
          className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
        />

        <select
          name="property_type_id"
          value={filters.property_type_id}
          onChange={handleFilterChange}
          className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
        >
          <option value="">Any Type</option>
          {propertyTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.property_type}
            </option>
          ))}
        </select>

        <select
          name="property_bhk"
          value={filters.property_bhk}
          onChange={handleFilterChange}
          className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
        >
          <option value="">Any BHK</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4+ BHK</option>
        </select>

        <input
          name="min_price"
          type="number"
          value={filters.min_price}
          onChange={handleFilterChange}
          placeholder="Min Price"
          className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
        />

        <input
          name="max_price"
          type="number"
          value={filters.max_price}
          onChange={handleFilterChange}
          placeholder="Max Price"
          className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500 text-sm">
          {loading
            ? "Searching..."
            : `${properties.length} propert${properties.length === 1 ? "y" : "ies"} found`}
        </p>
        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="w-full h-44 bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No properties match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/properties/${p.id}`}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-green-500 transition-all block"
            >
              <PropertyThumbnail propertyId={p.id} alt={p.property_name} />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                  {p.property_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {p.location ? `${p.location}, ` : ""}
                  {p.city}
                </p>
                <p className="text-sm text-gray-500">
                  {p.property_bhk} BHK ·{" "}
                  {p.property_size ? `${p.property_size} sq ft` : "—"}
                </p>
                <p className="text-lg font-bold text-green-600 mt-2">
                 { formatPrice(p.property_price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60 
            transition-colors"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}