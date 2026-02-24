import React, { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { FormInput } from "../shared/FormInput";
import { PasswordInput } from "../shared/PasswordInput";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { UserPlatform, AuthFormData } from "../types/auth.types";
import sharedStyles from "../styles/shared.module.css";

interface LoginFormProps {
  platform: UserPlatform;
}

export const LoginForm = ({ platform }: LoginFormProps) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        platform,
      });

      if (!response || response.error) {
        const message =
          response?.error === "CredentialsSignin"
            ? "Invalid email or password."
            : response?.error || "Login failed";
        throw new Error(message);
      }

      // Ensure session is established before requesting SSO token (avoids 401 race)
      await getSession();

      let ssoResponse = await fetch("/api/auth/sso-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
        credentials: "same-origin",
      });

      if (ssoResponse.status === 401) {
        await new Promise((r) => setTimeout(r, 200));
        ssoResponse = await fetch("/api/auth/sso-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform }),
          credentials: "same-origin",
        });
      }

      if (!ssoResponse.ok) {
        const data = await ssoResponse.json().catch(() => ({}));
        throw new Error(data?.error || "Unable to start SSO session");
      }

      const data = await ssoResponse.json();
      if (!data?.redirectUrl) {
        throw new Error("SSO redirect URL not available");
      }

      window.location.href = data.redirectUrl;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={sharedStyles.form}>
      {error && <div className={sharedStyles.error}>{error}</div>}

      <FormInput
        id="email"
        name="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <PasswordInput
        id="password"
        name="password"
        label="Password"
        value={formData.password}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <div className={sharedStyles.forgotPassword}>
        <Link href={`/Auth/forgot-password`} className={sharedStyles.link}>
          Forgot your password?
        </Link>
      </div>

      <button type="submit" className={sharedStyles.button} disabled={loading}>
        {loading ? (
          <>
            <LoadingSpinner size="sm" color="white" />
            <span>Logging in...</span>
          </>
        ) : (
          "Login"
        )}
      </button>

      <div className={sharedStyles.links}>
        <Link href={`/Auth/register/${platform}`} className={sharedStyles.link}>
          Don&apos;t have an account? Register here
        </Link>
      </div>
    </form>
  );
};
