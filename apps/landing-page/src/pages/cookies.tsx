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

export const CookiePolicyPage: NextPage<LegalPageProps> = () => {
  return (
    <>
      <Head>
        <title>Cookie Policy | EFL Explorers</title>
        <meta
          name="description"
          content="Learn how EFL Explorers uses cookies and similar technologies."
        />
      </Head>
      <PageLayout>
        <section className={styles.page} data-cy="cookie-policy-page">
          <div className={styles.container}>
            <h1 className={styles.title}>Cookie Policy</h1>
            <p className={styles.updated}>Last updated: Feb 23, 2026</p>
            <p className={styles.subtitle}>
              This policy explains how EFL Explorers uses cookies to improve the
              learning experience and keep the platform secure.
            </p>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>What Are Cookies?</h2>
              <p className={styles.sectionText}>
                Cookies are small text files stored on your device. They help
                websites remember your preferences and activity.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>How We Use Cookies</h2>
              <p className={styles.sectionText}>
                We use cookies to keep you signed in, remember settings, and
                understand how the platform is used.
              </p>
              <ul className={styles.list}>
                <li>Essential cookies for login and security.</li>
                <li>Preference cookies to save your settings.</li>
                <li>Analytics cookies to improve our experience.</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Managing Cookies</h2>
              <p className={styles.sectionText}>
                You can control or delete cookies from your browser settings.
                Some features may not work properly if cookies are disabled.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Updates</h2>
              <p className={styles.sectionText}>
                We may update this policy from time to time. Please check back
                for the latest version.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Contact</h2>
              <p className={styles.sectionText}>
                If you have questions about cookies, reach out via the contact
                page.
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

export default CookiePolicyPage;
