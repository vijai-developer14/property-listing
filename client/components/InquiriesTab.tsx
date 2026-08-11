"use client";

import { useState, useEffect } from "react";

type Inquiry = {
  id: number;
  property_id: number;
  property_name: string;
  sender_name: string;
  sender_phone: string;
  message: string;
  created_at: string;
};

export default function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/mine`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setInquiries(data.inquiries || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading inquiries...</p>;
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No inquiries yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inq) => (
        <div key={inq.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{inq.sender_name}</h3>
              <p className="text-sm text-gray-500">{inq.sender_phone}</p>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(inq.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-2">{inq.message}</p>
          <p className="text-xs text-green-600 mt-2 font-medium">
            Re: {inq.property_name}
          </p>
        </div>
      ))}
    </div>
  );
}