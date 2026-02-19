"use client";

import Link from "next/link";
import styles from "./AuthButtons.module.css";

export interface AuthButtonsLink {
  label: string;
  href: string;
}

export interface AuthButtonsContent {
  login: AuthButtonsLink;
  register: AuthButtonsLink;
}

export interface AuthButtonsProps {
  content?: AuthButtonsContent | null;
}

const AuthButtonsInner = ({ content }: AuthButtonsProps) => {
  if (!content) return null;
  const login = content.login;
  const register = content.register;

  return (
    <div className={styles.authButtons} data-cy="auth-buttons">
      <Link
        href={login.href}
        className={styles.loginButton}
        data-cy="auth-login-link"
      >
        {login.label}
      </Link>
      <Link
        href={register.href}
        className={styles.registerButton}
        data-cy="auth-register-link"
      >
        {register.label}
      </Link>
    </div>
  );
};

export const AuthButtons = ({ content }: AuthButtonsProps) => {
  return <AuthButtonsInner content={content} />;
};

export { AuthButtons as default };
