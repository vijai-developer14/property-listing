"use client";

import { useState } from "react";

type ImageUploadProps = {
  propertyId: number;
  onSuccess: () => void;
};

export default function ImageUpload({ propertyId, onSuccess }: ImageUploadProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setError("");
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setError("Select at least one image");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/property-images/${propertyId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Upload failed");
        return;
      }

      setFiles(null);
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-3 space-y-2">
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="text-sm"
      />
      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading || !files}
        className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg disabled:opacity-60"
      >
        {uploading ? "Uploading..." : "Upload Photos"}
      </button>
    </div>
  );
}