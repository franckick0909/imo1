import { NextResponse } from "next/server";

// Fonction pour compresser les réponses JSON
export function compressedResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  options: { status?: number } = {}
) {
  const response = NextResponse.json(data, { status: options.status || 200 });

  // Ajouter des en-têtes de compression et performance
  response.headers.set("Content-Encoding", "gzip");
  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300"); // 5 minutes
  response.headers.set("Vary", "Accept-Encoding");

  return response;
}

// Fonction pour créer une réponse avec cache approprié
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cachedResponse(data: any, cacheSeconds: number = 300) {
  const response = NextResponse.json(data);

  // Cache pour différents types de contenu
  if (cacheSeconds > 0) {
    response.headers.set(
      "Cache-Control",
      `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`
    );
  } else {
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
  }

  response.headers.set("ETag", `"${Date.now()}"`);
  response.headers.set("Vary", "Accept-Encoding");

  return response;
}

// Fonction pour les réponses d'erreur optimisées
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message, timestamp: new Date().toISOString() },
    { status }
  );
}
