import { AuthMappingPanel } from "@/components/phases/AuthMappingPanel";
import { ConnectivityPanel } from "@/components/phases/ConnectivityPanel";
import { CurriculumExplorerPanel } from "@/components/phases/CurriculumExplorerPanel";
import { LandingLogicPanel } from "@/components/phases/LandingLogicPanel";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { getIdentityBridgeData } from "@/server/queries/auth-mapping";
import { getConnectivityData } from "@/server/queries/connectivity";
import { getCurriculumExplorerData } from "@/server/queries/curriculum";
import { getLandingLogicData } from "@/server/queries/landing";

import styles from "./page.module.css";

type DashboardTab = "landing" | "auth" | "curriculum" | "connectivity";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const parseTab = (value: string | string[] | undefined): DashboardTab => {
  const tab = Array.isArray(value) ? value[0] : value;
  if (tab === "auth" || tab === "curriculum" || tab === "connectivity") {
    return tab;
  }
  return "landing";
};

const parseUserId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const DashboardPage = async ({ searchParams }: PageProps) => {
  const params = (await searchParams) ?? {};
  const activeTab = parseTab(params.tab);
  const selectedUserId = parseUserId(params.userId);

  const [landingData, identityData, curriculumData, connectivityData] = await Promise.all([
    getLandingLogicData(),
    getIdentityBridgeData(selectedUserId),
    getCurriculumExplorerData(),
    getConnectivityData(),
  ]);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <h1>EFL Ecosystem DB Visualizer</h1>
        <p>
          Read-only server-rendered inspector for cross-schema flows from landing content through auth mappings
          and curriculum snapshots.
        </p>
      </header>

      <DashboardTabs activeTab={activeTab} selectedUserId={identityData.selectedUser?.id} />

      <section className={styles.panelArea}>
        {activeTab === "landing" ? <LandingLogicPanel data={landingData} /> : null}
        {activeTab === "auth" ? (
          <AuthMappingPanel data={identityData} activeUserId={identityData.selectedUser?.id} />
        ) : null}
        {activeTab === "curriculum" ? <CurriculumExplorerPanel data={curriculumData} /> : null}
        {activeTab === "connectivity" ? <ConnectivityPanel data={connectivityData} /> : null}
      </section>
    </main>
  );
};

export default DashboardPage;
