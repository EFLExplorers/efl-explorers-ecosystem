import type { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireActiveCurriculumManager } from "@/lib/curriculumDashboardGuard";
import styles from "@/pages/dashboard/workspace.module.css";

type InviteRecord = {
  id: string;
  email: string;
  createdAt: string;
  expiresAt: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const access = await requireActiveCurriculumManager(context);
  if ("redirect" in access) {
    return access;
  }
  return { props: {} };
};

export const InvitesPage = () => {
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (value: string | null) => {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toLocaleString();
  };

  const loadInvites = async () => {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/invites");
    const data = (await response.json()) as { invites?: InviteRecord[]; error?: string };
    if (!response.ok) {
      setError(data.error ?? "Failed to fetch invites");
      setLoading(false);
      return;
    }
    setInvites(data.invites ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void loadInvites();
  }, []);

  const createInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const response = await fetch("/api/auth/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Failed to create invite");
      setSubmitting(false);
      return;
    }
    setEmail("");
    await loadInvites();
    setSuccess("Invite saved successfully.");
    setSubmitting(false);
  };

  return (
    <DashboardShell
      pageTitle="Invites"
      pageSubtitle="[wireframe] Manager invite lifecycle"
    >
      <div className={styles.workspaceRoot}>
      <section className={styles.card}>
        <h2>Create invite</h2>
        <form onSubmit={createInvite}>
          <label className={styles.field}>
            Manager email
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Send/refresh invite"}
          </button>
        </form>
        {error ? <p className={styles.error}>{error}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}
      </section>

      <section className={styles.card}>
        <h2>Current invites</h2>
        {loading ? <p>Loading...</p> : null}
        {!loading ? (
          <ul className={styles.list}>
            {invites.map((invite) => (
              <li key={invite.id}>
                <strong>{invite.email}</strong>{" "}
                <span className={styles.meta}>
                  - {invite.acceptedAt ? "accepted" : "pending"}
                  {invite.expiresAt ? `, expires ${formatDate(invite.expiresAt)}` : ""}
                  {invite.acceptedAt ? `, accepted ${formatDate(invite.acceptedAt)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {!loading && invites.length === 0 ? (
          <p className={styles.empty}>No invites yet. Create one above.</p>
        ) : null}
      </section>
      </div>
    </DashboardShell>
  );
};

export default InvitesPage;
