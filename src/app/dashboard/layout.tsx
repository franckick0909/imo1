import { auth } from "@/lib/auth";
import { getDashboardStatsAction } from "@/lib/dashboard-actions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DashboardClientLayout from "./DashboardClientLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier l'authentification
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  // Prefetch des données critiques en parallèle
  const [statsResult] = await Promise.all([
    getDashboardStatsAction().catch(() => ({ success: false, data: null })),
  ]);

  const stats = statsResult.success ? statsResult.data : null;

  return (
    <Suspense
      fallback={<div className="min-h-screen bg-gray-50">Chargement...</div>}
    >
      <DashboardClientLayout user={session.user} stats={stats}>
        {children}
      </DashboardClientLayout>
    </Suspense>
  );
}
