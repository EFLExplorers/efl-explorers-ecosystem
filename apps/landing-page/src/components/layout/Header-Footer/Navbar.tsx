import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import styles from "./Navbar.module.css";

export interface NavbarLink {
  label: string;
  href: string;
}

export interface NavbarDropdown {
  label: string;
  items: NavbarLink[];
}

export interface NavbarContent {
  dropdown: NavbarDropdown;
  links: NavbarLink[];
}

export interface NavbarProps {
  content?: NavbarContent | null;
}

export const Navbar = ({ content }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!content) return null;
  const dropdown = content.dropdown;
  const links = content.links || [];

  return (
    <nav className={styles.desktopNav} data-cy="navbar">
      <div className={styles.dropdown}>
        <button
          className={styles.navLink}
          onClick={() => setIsOpen(!isOpen)}
          data-cy="nav-platforms-trigger"
        >
          {dropdown.label} <ChevronDown className={`${styles.dropdownIcon} ${isOpen ? styles.rotated : ''}`} />
        </button>
        {isOpen && (
          <div
            className={styles.dropdownContent}
            data-cy="nav-platforms-menu"
          >
            {(dropdown.items || []).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.dropdownLink}
                onClick={() => setIsOpen(false)}
                data-cy={`nav-dropdown-link-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={styles.navLink}
          data-cy={`nav-link-${link.label.toLowerCase()}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export { Navbar as default };
