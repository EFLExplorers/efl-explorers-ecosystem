"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { DashboardPageHeader } from "@/components/layout/DashboardPageHeader";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { AuthMappingPanel } from "@/components/phases/AuthMappingPanel";
import { useDatabaseSnapshot } from "@/context/DatabaseSnapshotProvider";

const AuthRoutePageInner = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? undefined;
  const { snapshot, lastError } = useDatabaseSnapshot();

  return (
    <>
      <DashboardPageHeader
        title="Auth & identity mapping"
        description="Inspect auth users, student/teacher bridges, and documented Prisma coverage gaps."
      />
      {lastError ? <RouteWarning message={`Sync: ${lastError}`} /> : null}
      <AuthMappingPanel data={snapshot.auth} activeUserId={userId ?? snapshot.auth.selectedUser?.id} />
    </>
  );
};

export const AuthRoutePage = () => (
  <Suspense fallback={<p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Loading auth…</p>}>
    <AuthRoutePageInner />
  </Suspense>
);

export default AuthRoutePage;
