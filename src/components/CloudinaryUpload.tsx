"use client";

import { FOLDERS, UPLOAD_PRESETS } from "@/lib/cloudinary-client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useRef, useState } from "react";

interface CloudinaryUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function CloudinaryUpload({
  images,
  onImagesChange,
  maxImages = 10,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadedInSession, setUploadedInSession] = useState<string[]>([]);

  // Utiliser useRef pour éviter les problèmes de closure avec les states
  const uploadedImagesRef = useRef<string[]>([]);

  // Vérifier si Cloudinary est configuré
  const isCloudinaryConfigured =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadSuccess = (result: any) => {
    console.log("Upload success:", result);
    console.log("Result type:", typeof result);
    console.log("Result keys:", Object.keys(result || {}));
    console.log("Result info:", result?.info);

    // Construire l'URL de l'image à partir des informations Cloudinary
    if (result?.info?.public_id) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const secureUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v${result.info.version}/${result.info.public_id}`;

      console.log("Constructed secure URL:", secureUrl);

      uploadedImagesRef.current.push(secureUrl);
      setUploadedInSession((prev) => [...prev, secureUrl]);
      console.log("Image added to session:", secureUrl);
      console.log("Current session images:", uploadedImagesRef.current);
    } else {
      console.warn("No public_id in result info:", result?.info);
    }
  };

  const handleUploadClose = () => {
    console.log("Upload widget closed");
    // Ne pas reset ici, laisser handleQueuesEnd gérer
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleQueuesEnd = (result: any) => {
    setIsUploading(false);
    console.log("All uploads completed:", result);
    console.log("Images in ref:", uploadedImagesRef.current);
    console.log("Images in state:", uploadedInSession);
    console.log("Current images:", images);

    // Utiliser la référence qui contient toutes les images
    if (uploadedImagesRef.current.length > 0) {
      const newImages = [...images, ...uploadedImagesRef.current];
      console.log("Adding images to main state:", newImages);
      onImagesChange(newImages);

      // Reset pour la prochaine session
      uploadedImagesRef.current = [];
      setUploadedInSession([]);
    } else {
      console.log("No images uploaded in this session");
      // Vérifier si on a des images dans la session state
      if (uploadedInSession.length > 0) {
        console.log("Using session state images:", uploadedInSession);
        const newImages = [...images, ...uploadedInSession];
        onImagesChange(newImages);
        setUploadedInSession([]);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadError = (error: any) => {
    setIsUploading(false);
    console.error("Upload error:", error);
    console.error("Error type:", typeof error);
    console.error("Error keys:", Object.keys(error || {}));

    // Log détaillé de l'erreur
    if (error?.error) {
      console.error("Error details:", {
        message: error.error.message,
        code: error.error.code,
        status: error.error.status,
      });
    }

    // Log de l'erreur complète
    console.error("Full error object:", JSON.stringify(error, null, 2));

    // Ne pas reset automatiquement, laisser handleQueuesEnd gérer
    // Sauf si c'est une erreur critique
    if (error?.error?.message?.includes("cancel")) {
      console.log("Upload cancelled by user");
    } else {
      const errorMessage = error?.error?.message || "Erreur lors de l'upload";
      alert(`Erreur lors de l'upload: ${errorMessage}`);
    }
  };

  const handleQueuesStart = () => {
    setIsUploading(true);
    // Reset seulement si on commence une nouvelle session
    if (uploadedImagesRef.current.length === 0) {
      uploadedImagesRef.current = [];
      setUploadedInSession([]);
      console.log("New upload session started");
    } else {
      console.log("Continuing upload session");
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const moveImageToFirst = (index: number) => {
    if (index === 0) return; // Déjà en première position

    const newImages = [...images];
    const [movedImage] = newImages.splice(index, 1);
    newImages.unshift(movedImage);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const canAddMore = images.length < maxImages;

  // Si Cloudinary n'est pas configuré, afficher un message d'erreur
  if (!isCloudinaryConfigured) {
    return (
      <div className="space-y-6">
        <div className="w-full border-2 border-red-200 rounded-lg p-6 text-center bg-red-50">
          <svg
            className="w-12 h-12 mx-auto text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Configuration Cloudinary manquante
          </h3>
          <p className="text-red-700 mb-4">
            Les variables d&apos;environnement Cloudinary ne sont pas
            configurées.
          </p>
          <div className="bg-white p-4 rounded border text-sm text-gray-700">
            <p className="font-medium mb-2">Variables nécessaires :</p>
            <ul className="space-y-1">
              <li>• NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</li>
              <li>• NEXT_PUBLIC_CLOUDINARY_API_KEY</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Ajoutez ces variables dans votre fichier .env.local
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Widget */}
      {canAddMore && (
        <CldUploadWidget
          uploadPreset={UPLOAD_PRESETS.products}
          options={{
            multiple: true,
            maxFiles: Math.min(5, maxImages - images.length),
            resourceType: "image",
            clientAllowedFormats: ["jpeg", "jpg", "png", "webp"],
            maxFileSize: 5000000, // 5MB
            folder: FOLDERS.products,
            sources: ["local"],
            showAdvancedOptions: false,
            cropping: false,
            showSkipCropButton: false,
            showPoweredBy: false,
          }}
          onQueuesStart={handleQueuesStart}
          onQueuesEnd={handleQueuesEnd}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
          onClose={handleUploadClose}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={isUploading}
              className="w-full border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                  <p className="text-emerald-600 font-medium">
                    Upload en cours...
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {uploadedInSession.length > 0
                      ? `${uploadedInSession.length} image(s) uploadée(s)...`
                      : "Téléchargement de vos images"}
                  </p>
                </div>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 mx-auto text-emerald-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-emerald-600 font-medium mb-2">
                    Ajouter des images produit
                  </p>
                  <p className="text-sm text-gray-500">
                    Cliquez pour sélectionner ou glissez-déposez
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    JPEG, PNG, WebP • Max 5MB par image • {images.length}/
                    {maxImages} images
                  </p>
                </>
              )}
            </button>
          )}
        </CldUploadWidget>
      )}

      {/* Limite atteinte */}
      {!canAddMore && (
        <div className="w-full border-2 border-gray-200 rounded-lg p-6 text-center bg-gray-50">
          <svg
            className="w-8 h-8 mx-auto text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500 font-medium">
            Limite atteinte ({maxImages} images max)
          </p>
          <p className="text-sm text-gray-400">
            Supprimez une image pour en ajouter une nouvelle
          </p>
        </div>
      )}

      {/* Debug info - à supprimer en production */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
          <p>
            <strong>Debug:</strong>
          </p>
          <p>Images actuelles: {images.length}</p>
          <p>Session upload (state): {uploadedInSession.length}</p>
          <p>Session upload (ref): {uploadedImagesRef.current.length}</p>
          <p>En cours d&apos;upload: {isUploading ? "Oui" : "Non"}</p>
          <p>Cloudinary configuré: {isCloudinaryConfigured ? "Oui" : "Non"}</p>
          <p>
            Cloud Name:{" "}
            {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "Non défini"}
          </p>
          <p>
            API Key:{" "}
            {process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
              ? "Défini"
              : "Non défini"}
          </p>
          <p>Upload Preset: {UPLOAD_PRESETS.products}</p>

          {/* Bouton de test */}
          <div className="mt-3 pt-3 border-t border-yellow-300">
            <button
              type="button"
              onClick={() => {
                const testImage =
                  "https://res.cloudinary.com/dlmcrlimw/image/upload/v1/sample";
                onImagesChange([...images, testImage]);
                console.log("Test image added");
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              Test: Ajouter image
            </button>
          </div>
        </div>
      )}

      {/* Grille d'images */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Images du produit ({images.length})
            </h3>
            {images.length > 0 && (
              <p className="text-xs text-emerald-600">
                ✨ Glissez-déposez pour réorganiser
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative group bg-white border-2 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-move ${
                  draggedIndex === index
                    ? "border-emerald-500 shadow-lg scale-105"
                    : index === 0
                      ? "border-emerald-300"
                      : "border-gray-200"
                }`}
              >
                {/* Badge numéro d'ordre */}
                <div
                  className={`absolute top-2 left-2 text-white text-xs font-medium px-2 py-1 rounded z-10 ${
                    index === 0 ? "bg-emerald-500" : "bg-gray-500"
                  }`}
                >
                  {index === 0 ? "Principal" : `${index + 1}`}
                </div>

                {/* Image */}
                <div className="aspect-square relative">
                  <Image
                    src={imageUrl}
                    alt={`Image produit ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {/* Bouton définir comme principal */}
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => moveImageToFirst(index)}
                      className="bg-emerald-500 text-white rounded-full p-1.5 hover:bg-emerald-600 transition-colors"
                      title="Définir comme image principale"
                      aria-label="Définir comme image principale"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Bouton suppression */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                    title="Supprimer cette image"
                    aria-label="Supprimer cette image"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Overlay avec info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium truncate">
                    {index === 0 ? "Image principale" : `Image ${index + 1}`}
                  </p>
                  <p className="text-white text-xs opacity-75">
                    Glissez pour réorganiser
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          {images.length > 0 && (
            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  💡 Conseils pour organiser vos images
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>Glissez-déposez</strong> les images pour les
                    réorganiser
                  </li>
                  <li>
                    • Cliquez sur l&apos;⭐ pour définir une image comme
                    principale
                  </li>
                  <li>
                    • La première image sera affichée sur la liste des produits
                  </li>
                  <li>• Utilisez des images haute qualité (min. 800px)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
