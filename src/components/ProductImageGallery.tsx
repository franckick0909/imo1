"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  position: number;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <svg
          className="w-24 h-24 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4zm0 6a2 2 0 000 4h12a2 2 0 000-4H4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  const currentImage = images[selectedImageIndex];

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg relative group">
        <Image
          src={currentImage.url}
          alt={
            currentImage.alt ||
            `${productName} - Image ${selectedImageIndex + 1}`
          }
          width={600}
          height={600}
          className="w-full h-full object-cover"
          priority={selectedImageIndex === 0}
        />

        {/* Navigation par flèches (si plus d'une image) */}
        {images.length > 1 && (
          <>
            {/* Flèche précédente */}
            <button
              onClick={() =>
                setSelectedImageIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Image précédente"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Flèche suivante */}
            <button
              onClick={() =>
                setSelectedImageIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Image suivante"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Indicateur de position */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImageIndex === index
                  ? "border-emerald-500 ring-2 ring-emerald-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              aria-label={`Voir l'image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} - Miniature ${index + 1}`}
                width={150}
                height={150}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Informations sur les images */}
      {images.length > 1 && (
        <div className="text-center text-sm text-gray-500">
          <p>
            {images.length} images disponibles • Cliquez sur les miniatures pour
            naviguer
          </p>
        </div>
      )}
    </div>
  );
}
