import Link from "next/link";
import Logo from "./Logo";
import styles from "./Footer.module.css";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterContent {
  columns: FooterColumn[];
  bottomBar: string[];
}

export interface FooterProps {
  content?: FooterContent | null;
}

export const Footer = ({ content }: FooterProps) => {
  if (!content?.columns?.length && !content?.bottomBar?.length) return null;

  return (
    <footer className={styles.footer} data-cy="site-footer">
      <div className={styles.footerContent}>
        <div className={styles.logoSection} data-cy="footer-logo-section">
          <Logo />
        </div>

        <div className={styles.linksSection} data-cy="footer-links-section">
          {(content.columns || []).map((column) => (
            <div className={styles.column} key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottomBar} data-cy="footer-bottom-bar">
        {(content.bottomBar || []).map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>
    </footer>
  );
};

export { Footer as default };
