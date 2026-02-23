import type { NextPage } from "next";
import Head from "next/head";
import { GetStaticProps } from "next";
import { PageLayout } from "../components/layout/PageLayout";
import type { HeaderContent } from "../components/layout/Header-Footer/Header";
import type { FooterContent } from "../components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "../utils/globalSections";
import styles from "../styles/pages/LegalPage.module.css";

interface LegalPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
}

export const TermsPage: NextPage<LegalPageProps> = () => {
  return (
    <>
      <Head>
        <title>Terms of Service | EFL Explorers</title>
        <meta
          name="description"
          content="Review the terms and conditions for using EFL Explorers."
        />
      </Head>
      <PageLayout>
        <section className={styles.page} data-cy="terms-page">
          <div className={styles.container}>
            <h1 className={styles.title}>Terms of Service</h1>
            <p className={styles.updated}>Last updated: Feb 23, 2026</p>
            <p className={styles.subtitle}>
              These terms outline how EFL Explorers provides access to our
              learning tools, accounts, and services. By using the platform, you
              agree to the terms below.
            </p>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Accounts & Access</h2>
              <p className={styles.sectionText}>
                Keep your login details secure and make sure your account
                information is accurate. You are responsible for activity that
                happens under your account.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Acceptable Use</h2>
              <p className={styles.sectionText}>
                Use EFL Explorers for learning and teaching purposes only. Do
                not attempt to disrupt the platform, misuse content, or violate
                applicable laws.
              </p>
              <ul className={styles.list}>
                <li>No unauthorized sharing of accounts or access.</li>
                <li>No scraping, reverse engineering, or automated abuse.</li>
                <li>Respect student and teacher privacy at all times.</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Payments & Plans</h2>
              <p className={styles.sectionText}>
                Paid plans renew based on the selected billing period. Plan
                details and pricing are shown on the pricing page and may be
                updated with notice.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Content & Ownership</h2>
              <p className={styles.sectionText}>
                All learning content, visuals, and platform features are owned
                by EFL Explorers or its licensors. You may not copy, redistribute,
                or resell this content without permission.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Termination</h2>
              <p className={styles.sectionText}>
                We may suspend or terminate access if these terms are violated.
                You can close your account at any time by contacting support.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Contact</h2>
              <p className={styles.sectionText}>
                Questions about these terms? Reach out via the contact page and
                we will help.
              </p>
            </div>
          </div>
        </section>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps<LegalPageProps> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();

  return {
    props: {
      headerContent,
      footerContent,
    },
  };
};

export default TermsPage;
