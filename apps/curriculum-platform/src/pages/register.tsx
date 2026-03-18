import { useState } from "react";
import { useRouter } from "next/router";

import styles from "@/pages/register.module.css";

type RegisterResponse = {
  error?: string;
  success?: boolean;
};

export const RegisterPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setOk(false);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = (await response.json()) as RegisterResponse;
    if (!response.ok) {
      setError(data.error ?? "Registration failed");
      setSubmitting(false);
      return;
    }

    setOk(true);
    setSubmitting(false);
    setTimeout(() => {
      void router.push("/login");
    }, 900);
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>Create Curriculum Manager Account</h1>
        <p>Invite-only registration. Contact an existing manager if blocked.</p>
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            Name
            <input
              className={styles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label className={styles.field}>
            Email
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className={styles.field}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </button>
          {error ? <p className={styles.error}>{error}</p> : null}
          {ok ? <p className={styles.ok}>Account created. Redirecting to sign in...</p> : null}
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;
