import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetStaticProps } from "next";
import { PasswordInput } from "../../../components/auth/shared/PasswordInput";
import { AuthContainer } from "../../../components/auth/layout/AuthContainer";
import sharedStyles from "../../../components/auth/styles/shared.module.css";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";
import { prisma } from "@repo/database";

interface ResetPasswordPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  title: string;
  subtitle: string;
  newPasswordLabel: string;
  confirmPasswordLabel: string;
  submitButtonLabel: string;
  submitButtonLoadingLabel: string;
  backToLoginText: string;
  backToLoginHref: string;
  successTitle: string;
  successSubtitle: string;
  successMessage: string;
  successGoToLoginText: string;
  successGoToLoginHref: string;
}

export const ResetPasswordPage = ({
  title,
  subtitle,
  newPasswordLabel,
  confirmPasswordLabel,
  submitButtonLabel,
  submitButtonLoadingLabel,
  backToLoginText,
  backToLoginHref,
  successTitle,
  successSubtitle,
  successMessage,
  successGoToLoginText,
  successGoToLoginHref,
}: ResetPasswordPageProps) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const queryToken = router.query.token;
    if (typeof queryToken === "string") {
      setToken(queryToken);
      return;
    }
    setToken(null);
  }, [router.isReady, router.query.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Please request a new reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Failed to reset password");
      }

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthContainer title={successTitle} subtitle={successSubtitle}>
        <div className={sharedStyles.messageBox}>
          <p>{successMessage}</p>
        </div>
        <div className={sharedStyles.links}>
          <Link href={successGoToLoginHref} className={sharedStyles.link}>
            {successGoToLoginText}
          </Link>
        </div>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit} className={sharedStyles.form}>
        {error && <div className={sharedStyles.error}>{error}</div>}

        <PasswordInput
          id="password"
          name="password"
          label={newPasswordLabel}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          showStrength={true}
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label={confirmPasswordLabel}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button
          type="submit"
          className={sharedStyles.button}
          disabled={loading || !token}
        >
          {loading ? submitButtonLoadingLabel : submitButtonLabel}
        </button>

        <div className={sharedStyles.links}>
          <Link href={backToLoginHref} className={sharedStyles.link}>
            {backToLoginText}
          </Link>
        </div>
      </form>
    </AuthContainer>
  );
};

export default ResetPasswordPage;

export const getStaticProps: GetStaticProps<ResetPasswordPageProps> =
  async () => {
    const { headerContent, footerContent } = await getGlobalLayoutContent();

    const pageData = await prisma.page.findUnique({
      where: { route: "/Auth/reset-password" },
      select: { id: true },
    });

    if (!pageData?.id) {
      throw new Error(
        "[ResetPassword] Missing pages row for route '/Auth/reset-password': no id"
      );
    }

    const sectionData = await prisma.pageSection.findFirst({
      where: {
        pageId: pageData.id,
        sectionKey: "form",
        active: true,
      },
      select: { content: true },
    });

    if (!sectionData) {
      throw new Error(
        "[ResetPassword] Missing page_sections for '/Auth/reset-password' (form): no data"
      );
    }

    const content = sectionData.content as any;
    if (!content.form || !content.success) {
      throw new Error(
        "[ResetPassword] Missing form or success content in section"
      );
    }

    const formContent = content.form;
    const successContent = content.success;

    if (
      !formContent.title ||
      !formContent.subtitle ||
      !formContent.new_password_label ||
      !formContent.confirm_password_label ||
      !formContent.submit_button_label ||
      !formContent.submit_button_loading_label ||
      !formContent.back_to_login_text ||
      !formContent.back_to_login_href
    ) {
      throw new Error(
        "[ResetPassword] Missing required form content fields"
      );
    }

    if (
      !successContent.title ||
      !successContent.subtitle ||
      !successContent.message ||
      !successContent.go_to_login_text ||
      !successContent.go_to_login_href
    ) {
      throw new Error(
        "[ResetPassword] Missing required success content fields"
      );
    }

    return {
      props: {
        headerContent,
        footerContent,
        title: formContent.title,
        subtitle: formContent.subtitle,
        newPasswordLabel: formContent.new_password_label,
        confirmPasswordLabel: formContent.confirm_password_label,
        submitButtonLabel: formContent.submit_button_label,
        submitButtonLoadingLabel: formContent.submit_button_loading_label,
        backToLoginText: formContent.back_to_login_text,
        backToLoginHref: formContent.back_to_login_href,
        successTitle: successContent.title,
        successSubtitle: successContent.subtitle,
        successMessage: successContent.message,
        successGoToLoginText: successContent.go_to_login_text,
        successGoToLoginHref: successContent.go_to_login_href,
      },
      revalidate: 300,
    };
  };

