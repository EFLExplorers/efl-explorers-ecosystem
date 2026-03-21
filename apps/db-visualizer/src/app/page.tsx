import { AuthMappingPanel } from "@/components/phases/AuthMappingPanel";
import { ConnectivityPanel } from "@/components/phases/ConnectivityPanel";
import { CurriculumExplorerPanel } from "@/components/phases/CurriculumExplorerPanel";
import { LandingLogicPanel } from "@/components/phases/LandingLogicPanel";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SchemaHealthPanel } from "@/components/dashboard/SchemaHealthPanel";
import { getIdentityBridgeData } from "@/server/queries/auth-mapping";
import { getConnectivityData } from "@/server/queries/connectivity";
import { getCurriculumExplorerData } from "@/server/queries/curriculum";
import { getSchemaHealthData } from "@/server/queries/health";
import { getLandingLogicData } from "@/server/queries/landing";
import type {
  ConnectivityData,
  CurriculumExplorerData,
  IdentityBridgeData,
  LandingLogicData,
  SchemaHealthData,
} from "@/types/db-visualizer";

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

const EMPTY_LANDING_DATA: LandingLogicData = {
  pages: [],
  contentNodes: [],
  contentEdges: [],
  alienAssets: [],
};

const EMPTY_IDENTITY_DATA: IdentityBridgeData = {
  users: [],
  selectedUser: null,
  studentMapping: null,
  teacherMapping: null,
  linkedStudents: [],
};

const EMPTY_CURRICULUM_DATA: CurriculumExplorerData = {
  programs: [],
  liveSnapshotsByLevel: {},
};

const EMPTY_CONNECTIVITY_DATA: ConnectivityData = {
  matches: [],
  unmatchedStudents: [],
  levels: [],
};

const EMPTY_SCHEMA_HEALTH_DATA: SchemaHealthData = {
  checks: [],
  summary: {
    ok: 0,
    error: 0,
  },
};

const extractErrorMessage = (reason: unknown) => {
  if (reason instanceof Error && reason.message) {
    return reason.message;
  }
  return "Unknown server error";
};

export const DashboardPage = async ({ searchParams }: PageProps) => {
  const params = (await searchParams) ?? {};
  const activeTab = parseTab(params.tab);
  const selectedUserId = parseUserId(params.userId);

  const [healthResult, landingResult, identityResult, curriculumResult, connectivityResult] =
    await Promise.allSettled([
      getSchemaHealthData(),
      getLandingLogicData(),
      getIdentityBridgeData(selectedUserId),
      getCurriculumExplorerData(),
      getConnectivityData(),
    ]);

  const warnings: string[] = [];

  const healthData =
    healthResult.status === "fulfilled"
      ? healthResult.value
      : EMPTY_SCHEMA_HEALTH_DATA;
  if (healthResult.status === "rejected") {
    warnings.push(`Schema health unavailable: ${extractErrorMessage(healthResult.reason)}`);
  }

  const landingData =
    landingResult.status === "fulfilled" ? landingResult.value : EMPTY_LANDING_DATA;
  if (landingResult.status === "rejected") {
    warnings.push(`Landing data unavailable: ${extractErrorMessage(landingResult.reason)}`);
  }

  const identityData =
    identityResult.status === "fulfilled" ? identityResult.value : EMPTY_IDENTITY_DATA;
  if (identityResult.status === "rejected") {
    warnings.push(`Auth mapping data unavailable: ${extractErrorMessage(identityResult.reason)}`);
  }

  const curriculumData =
    curriculumResult.status === "fulfilled"
      ? curriculumResult.value
      : EMPTY_CURRICULUM_DATA;
  if (curriculumResult.status === "rejected") {
    warnings.push(
      `Curriculum explorer data unavailable: ${extractErrorMessage(curriculumResult.reason)}`
    );
  }

  const connectivityData =
    connectivityResult.status === "fulfilled"
      ? connectivityResult.value
      : EMPTY_CONNECTIVITY_DATA;
  if (connectivityResult.status === "rejected") {
    warnings.push(
      `Global connectivity data unavailable: ${extractErrorMessage(connectivityResult.reason)}`
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <h1>EFL Ecosystem DB Visualizer</h1>
        <p>
          Read-only server-rendered inspector for cross-schema flows from landing content through auth mappings
          and curriculum snapshots.
        </p>
      </header>

      {warnings.length > 0 ? (
        <section className={styles.warningList}>
          {warnings.map((warning) => (
            <p key={warning} className={styles.warningCard}>
              {warning}
            </p>
          ))}
        </section>
      ) : null}

      <SchemaHealthPanel data={healthData} />

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
