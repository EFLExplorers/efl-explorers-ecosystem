import React, { useState } from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";
import { FormInput } from "../../../components/auth/shared/FormInput";
import { AuthContainer } from "../../../components/auth/layout/AuthContainer";
import sharedStyles from "../../../components/auth/styles/shared.module.css";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";
import { parsePrismaJson } from "@/utils/prismaJson";
import { prisma } from "@repo/database";

interface ForgotPasswordPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  title: string;
  subtitle: string;
  emailLabel: string;
  submitButtonLabel: string;
  submitButtonLoadingLabel: string;
  backToLoginText: string;
  backToLoginHref: string;
  successTitle: string;
  successSubtitle: string;
  successMessage1: string;
  successMessage2: string;
  successReturnText: string;
  successReturnHref: string;
}

export const ForgotPasswordPage = ({
  title,
  subtitle,
  emailLabel,
  submitButtonLabel,
  submitButtonLoadingLabel,
  backToLoginText,
  backToLoginHref,
  successTitle,
  successSubtitle,
  successMessage1,
  successMessage2,
  successReturnText,
  successReturnHref,
}: ForgotPasswordPageProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Failed to request password reset");
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
          <p>
            {successMessage1.replace(/\{email\}/g, email)}
          </p>
          <p>{successMessage2}</p>
        </div>
        <div className={sharedStyles.links}>
          <Link href={successReturnHref} className={sharedStyles.link}>
            {successReturnText}
          </Link>
        </div>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit} className={sharedStyles.form}>
        {error && <div className={sharedStyles.error}>{error}</div>}

        <FormInput
          id="email"
          name="email"
          type="email"
          label={emailLabel}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <button
          type="submit"
          className={sharedStyles.button}
          disabled={loading}
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

export default ForgotPasswordPage;

const fallbackProps = {
  title: "Forgot Password",
  subtitle: "Enter your email to reset your password",
  emailLabel: "Email",
  submitButtonLabel: "Send Reset Link",
  submitButtonLoadingLabel: "Sending...",
  backToLoginText: "Back to Login",
  backToLoginHref: "/Auth/login",
  successTitle: "Check Your Email",
  successSubtitle: "We've sent you a password reset link",
  successMessage1: "We've sent a password reset link to {email}.",
  successMessage2:
    "Please check your email and click the link to reset your password. The link will expire in 1 hour.",
  successReturnText: "Return to Login",
  successReturnHref: "/Auth/login",
};

export const getStaticProps: GetStaticProps<ForgotPasswordPageProps> =
  async () => {
    const { headerContent, footerContent } = await getGlobalLayoutContent();

    const pageData = await prisma.page.findUnique({
      where: { route: "/Auth/forgot-password" },
      select: { id: true },
    });

    if (!pageData?.id) {
      return {
        props: {
          headerContent,
          footerContent,
          ...fallbackProps,
        },
        revalidate: 300,
      };
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
      return {
        props: {
          headerContent,
          footerContent,
          ...fallbackProps,
        },
        revalidate: 300,
      };
    }

    const content = parsePrismaJson<Record<string, any>>(sectionData.content);
    if (!content || !content.form || !content.success) {
      return {
        props: {
          headerContent,
          footerContent,
          ...fallbackProps,
        },
        revalidate: 300,
      };
    }

    const formContent = content.form;
    const successContent = content.success;

    if (
      !formContent.title ||
      !formContent.subtitle ||
      !formContent.email_label ||
      !formContent.submit_button_label ||
      !formContent.submit_button_loading_label ||
      !formContent.back_to_login_text ||
      !formContent.back_to_login_href
    ) {
      return {
        props: {
          headerContent,
          footerContent,
          ...fallbackProps,
        },
        revalidate: 300,
      };
    }

    if (
      !successContent.title ||
      !successContent.subtitle ||
      !successContent.message1 ||
      !successContent.message2 ||
      !successContent.return_text ||
      !successContent.return_href
    ) {
      return {
        props: {
          headerContent,
          footerContent,
          ...fallbackProps,
        },
        revalidate: 300,
      };
    }

    return {
      props: {
        headerContent,
        footerContent,
        title: formContent.title,
        subtitle: formContent.subtitle,
        emailLabel: formContent.email_label,
        submitButtonLabel: formContent.submit_button_label,
        submitButtonLoadingLabel: formContent.submit_button_loading_label,
        backToLoginText: formContent.back_to_login_text,
        backToLoginHref: formContent.back_to_login_href,
        successTitle: successContent.title,
        successSubtitle: successContent.subtitle,
        successMessage1: successContent.message1,
        successMessage2: successContent.message2,
        successReturnText: successContent.return_text,
        successReturnHref: successContent.return_href,
      },
      revalidate: 300,
    };
  };

