import { AuthMappingPanel } from "@/components/phases/AuthMappingPanel";
import { RouteWarning } from "@/components/layout/RouteWarning";
import { fetchFromApi } from "@/server/api-client";
import { normalizeIdentityData } from "@/server/normalize-api-data";
import type { IdentityBridgeData } from "@/types/db-visualizer";

type AuthRoutePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const parseUserId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const EMPTY_IDENTITY_DATA: IdentityBridgeData = {
  users: [],
  selectedUser: null,
  studentMapping: null,
  teacherMapping: null,
  linkedStudents: [],
};

export const AuthRoutePage = async ({ searchParams }: AuthRoutePageProps) => {
  const params = (await searchParams) ?? {};
  const selectedUserId = parseUserId(params.userId);

  let warning = "";
  let data = EMPTY_IDENTITY_DATA;

  try {
    const querySuffix = selectedUserId ? `?userId=${encodeURIComponent(selectedUserId)}` : "";
    const rawIdentityData = await fetchFromApi<unknown>(`/api/auth${querySuffix}`);
    data = normalizeIdentityData(rawIdentityData);
  } catch (error) {
    warning = error instanceof Error ? error.message : "Auth mapping data unavailable.";
  }

  return (
    <>
      {warning ? <RouteWarning message={`Auth mapping data unavailable: ${warning}`} /> : null}
      <AuthMappingPanel data={data} activeUserId={data.selectedUser?.id} />
    </>
  );
};

export default AuthRoutePage;
