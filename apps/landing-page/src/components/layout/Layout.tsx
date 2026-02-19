import { ReactNode, useEffect, useState } from "react";
import { Header, type HeaderContent } from "./Header-Footer/Header";
import { Footer, type FooterContent } from "./Header-Footer/Footer";
import styles from "../../styles/Layout.module.css";

interface LayoutProps {
  children: ReactNode;
  headerContent?: HeaderContent | null;
  footerContent?: FooterContent | null;
}

export const Layout = ({
  children,
  headerContent = null,
  footerContent = null,
}: LayoutProps) => {
  // Prefer server-provided header/footer.
  const [resolvedHeaderContent, setResolvedHeaderContent] =
    useState<HeaderContent | null>(headerContent);
  const [resolvedFooterContent, setResolvedFooterContent] =
    useState<FooterContent | null>(footerContent);

  useEffect(() => {
    setResolvedHeaderContent(headerContent ?? null);
    setResolvedFooterContent(footerContent ?? null);
  }, [headerContent, footerContent]);

  return (
    <div className={styles.appContainer}>
      <Header content={resolvedHeaderContent} />
      <main className={styles.main}>{children}</main>
      <Footer content={resolvedFooterContent} />
    </div>
  );
};
