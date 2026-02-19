import { useState } from "react";
import { signIn } from "next-auth/react";
import formStyles from "@/styles/auth/forms.module.css";
import componentStyles from "@/styles/auth/components.module.css";
import Link from "next/link";

interface RegistrationFormProps {
  platform: "student" | "teacher";
}

export const RegistrationForm = ({ platform }: RegistrationFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
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
        email,
        password,
        platform,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      window.location.href = `${process.env.NEXT_PUBLIC_STUDENT_URL}/dashboard`;
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className={formStyles.authForm}>
      {error && <div className={formStyles.error}>{error}</div>}

      <div className={formStyles.formGroup}>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className={formStyles.formGroup}>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className={formStyles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className={formStyles.formGroup}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
      </div>

      <div className={formStyles.formGroup}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={formStyles.submitButton}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <div className={componentStyles.links}>
        <Link href="/Auth/login">Already have an account? Login here</Link>
      </div>
    </form>
  );
};
