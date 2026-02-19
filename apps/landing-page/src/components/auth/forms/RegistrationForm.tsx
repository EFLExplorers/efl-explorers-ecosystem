import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormInput } from "../shared/FormInput";
import { PasswordInput } from "../shared/PasswordInput";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { UserPlatform, AuthFormData } from "../types/auth.types";
import { validateRegistration } from "../utils/authValidation";
import sharedStyles from "../styles/shared.module.css";

interface RegistrationFormProps {
  platform: UserPlatform;
}

export const RegistrationForm = ({ platform }: RegistrationFormProps) => {
  const [formData, setFormData] = useState<AuthFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    // Validate form data
    const validationError = validateRegistration(formData);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          platform,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Registration failed");
      }

      if (platform === "teacher") {
        window.location.href = "/Auth/register/teacher/pending";
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        platform,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      const ssoResponse = await fetch("/api/auth/sso-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });

      if (!ssoResponse.ok) {
        const data = await ssoResponse.json();
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
        id="firstName"
        name="firstName"
        type="text"
        label="First Name"
        value={formData.firstName || ""}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <FormInput
        id="lastName"
        name="lastName"
        type="text"
        label="Last Name"
        value={formData.lastName || ""}
        onChange={handleChange}
        required
        disabled={loading}
      />

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
        showStrength={true}
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        value={formData.confirmPassword || ""}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <button
        type="submit"
        className={sharedStyles.button}
        disabled={loading}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" color="white" />
            <span>Creating Account...</span>
          </>
        ) : (
          "Create Account"
        )}
      </button>

      <div className={sharedStyles.links}>
        <Link href="/Auth/login" className={sharedStyles.link}>
          Already have an account? Login here
        </Link>
      </div>
    </form>
  );
};
