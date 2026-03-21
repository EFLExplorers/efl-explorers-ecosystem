import { redirect } from "next/navigation";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const parseUserId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const parseTab = (value: string | string[] | undefined) => {
  const tab = Array.isArray(value) ? value[0] : value;
  if (tab === "auth" || tab === "curriculum" || tab === "connectivity") {
    return tab;
  }
  return "landing";
};

export const DashboardPage = async ({ searchParams }: PageProps) => {
  const params = (await searchParams) ?? {};
  const activeTab = parseTab(params.tab);
  const selectedUserId = parseUserId(params.userId);
  if (activeTab === "auth" && selectedUserId) {
    redirect(`/auth?userId=${encodeURIComponent(selectedUserId)}`);
  }
  redirect(`/${activeTab}`);
};

export default DashboardPage;
