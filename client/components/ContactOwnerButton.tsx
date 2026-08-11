"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, type InquiryFormData } from "./schemas/inquirySchema";

export default function ContactOwnerButton({ propertyId }: { propertyId: number }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", phone: "", message: "" },
  });

  const handleClick = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        setShowModal(true);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (data: InquiryFormData) => {
    setApiError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/${propertyId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setApiError(result.message || "Something went wrong");
        return;
      }

      setSuccess(true);
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSuccess(false);
    setApiError("");
    reset();
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={checking}
        className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
      >
        {checking ? "Please wait..." : "Contact Owner"}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            {success ? (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-4">Inquiry sent successfully!</p>
                <button onClick={closeModal} className="text-sm text-gray-500 hover:underline">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Owner</h3>
                {apiError && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                    {apiError}
                  </div>
                )}

                <input
                  type="text"
                  {...register("name")}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1 mb-2">{errors.name.message}</p>
                )}

                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="Your Phone Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 mt-3"
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1 mb-2">{errors.phone.message}</p>
                )}

                <textarea
                  {...register("message")}
                  placeholder="I'm interested in this property..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 mt-3"
                />
                {errors.message && (
                  <p className="text-red-600 text-xs mt-1 mb-2">{errors.message.message}</p>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}