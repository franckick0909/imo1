import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes qui nécessitent une authentification
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

// Routes réservées aux utilisateurs non connectés
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupérer le token de session depuis les cookies
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Vérifier si c'est une route d'authentification
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Si route protégée et pas de session, rediriger vers l'accueil
  if (isProtectedRoute && !sessionToken) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si route d'auth et utilisateur connecté, rediriger vers dashboard
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
