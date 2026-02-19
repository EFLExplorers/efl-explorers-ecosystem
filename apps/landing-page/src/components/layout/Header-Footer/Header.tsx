"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { Navbar, type NavbarContent } from "./Navbar";
import { AuthButtons, type AuthButtonsContent } from "../AuthButtons";
import styles from "./Header.module.css";

export interface HeaderContent {
  navbar?: NavbarContent;
  authButtons?: AuthButtonsContent;
}

export interface HeaderProps {
  content?: HeaderContent | null;
}

export const Header = ({ content }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        isMobileMenuOpen
      ) {
        // Only close if clicking outside the header
        const header = (event.target as Element).closest("header");
        if (!header) {
          closeMobileMenu();
        }
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={styles.header} data-cy="site-header">
      <div className={styles.container} data-cy="site-header-container">
        <Logo />

        {/* Desktop Navigation */}
        <Navbar content={content?.navbar} />
        <div className={styles.desktopAuthButtons}>
          <AuthButtons content={content?.authButtons} />
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
          data-cy="mobile-menu-button"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className={styles.mobileMenu}
          data-cy="mobile-menu"
        >
          <nav className={styles.mobileNav}>
            {/* Platform Links (rendered directly, no dropdown) */}
            {content?.navbar?.dropdown?.items?.map((item) => {
              // Format label to "Teacher's Platform" or "Student's Platform"
              const formattedLabel = `${item.label}'s Platform`;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.mobileNavLink}
                  onClick={closeMobileMenu}
                  data-cy={`mobile-nav-link-${item.label.toLowerCase()}`}
                >
                  {formattedLabel}
                </Link>
              );
            })}

            {/* Regular Links */}
            {content?.navbar?.links?.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
                data-cy={`mobile-nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Auth Buttons */}
            {content?.authButtons && (
              <div className={styles.mobileAuthButtons}>
                <Link
                  href={content.authButtons.login.href}
                  className={styles.mobileLoginButton}
                  onClick={closeMobileMenu}
                  data-cy="mobile-login-button"
                >
                  {content.authButtons.login.label}
                </Link>
                <Link
                  href={content.authButtons.register.href}
                  className={styles.mobileSignupButton}
                  onClick={closeMobileMenu}
                  data-cy="mobile-signup-button"
                >
                  {content.authButtons.register.label}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export { Header as default };
