// Configuration Cloudinary côté SERVEUR uniquement
// Ce fichier ne doit être importé que dans les API routes ou les Server Components

import { v2 as cloudinary } from "cloudinary";

// Configuration Cloudinary côté serveur
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration côté client pour le widget d'upload
export const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
};

// Preset d'upload pour les produits BioCrème
export const UPLOAD_PRESETS = {
  products: "produits biocreme", // Nom exact de votre preset Cloudinary
} as const;

// Dossiers d'organisation
export const FOLDERS = {
  products: "biocreme/products",
  categories: "biocreme/categories",
  users: "biocreme/users",
} as const;

// Transformations prédéfinies pour optimiser les images produits
export const TRANSFORMATIONS = {
  thumbnail: "c_fill,w_200,h_200,q_auto,f_auto",
  medium: "c_fill,w_500,h_500,q_auto,f_auto",
  large: "c_fill,w_800,h_800,q_auto,f_auto",
  hero: "c_fill,w_1200,h_800,q_auto,f_auto",
} as const;

export default cloudinary;
