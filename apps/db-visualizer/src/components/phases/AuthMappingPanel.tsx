import styles from "./AuthMappingPanel.module.css";

import type { IdentityBridgeData } from "@/types/db-visualizer";

type AuthMappingPanelProps = {
  data: IdentityBridgeData;
  activeUserId?: string;
};

const getBadgeClass = (exists: boolean) => {
  return exists ? styles.badgeOk : styles.badgeMissing;
};

export const AuthMappingPanel = ({ data, activeUserId }: AuthMappingPanelProps) => {
  return (
    <section className={styles.panel}>
      <article className={styles.selectorCard}>
        <h3>User Identity Inspector</h3>
        <form method="get" className={styles.selectorForm}>
          <label htmlFor="userId">Select auth.User</label>
          <select id="userId" name="userId" defaultValue={activeUserId ?? data.selectedUser?.id}>
            {data.users.map((user) => (
              <option key={user.id} value={user.id}>
                {(user.email ?? user.name ?? user.id).slice(0, 80)}
              </option>
            ))}
          </select>
          <button type="submit">Inspect</button>
        </form>
      </article>

      {data.selectedUser ? (
        <div className={styles.grid}>
          <article className={styles.card}>
            <h4>Auth User</h4>
            <dl>
              <dt>ID</dt>
              <dd>{data.selectedUser.id}</dd>
              <dt>Email</dt>
              <dd>{data.selectedUser.email ?? "N/A"}</dd>
              <dt>Role</dt>
              <dd>{data.selectedUser.role}</dd>
              <dt>Approved</dt>
              <dd>{data.selectedUser.approved ? "Yes" : "No"}</dd>
            </dl>
          </article>

          <article className={styles.card}>
            <h4>Mapping Bridge</h4>
            <p className={`${styles.badge} ${getBadgeClass(Boolean(data.studentMapping))}`}>
              Student Mapping: {data.studentMapping ? "Found" : "Missing"}
            </p>
            <p className={`${styles.badge} ${getBadgeClass(Boolean(data.teacherMapping))}`}>
              Teacher Mapping: {data.teacherMapping ? "Found" : "Missing"}
            </p>
          </article>

          <article className={styles.card}>
            <h4>Linked teachers.Student Profiles</h4>
            {data.linkedStudents.length === 0 ? (
              <p className={styles.note}>No student profile could be discovered via email correlation.</p>
            ) : (
              <ul className={styles.studentList}>
                {data.linkedStudents.map((student) => (
                  <li key={student.id}>
                    <strong>{student.fullName}</strong> - level `{student.level}` - unit `{student.unitId}`
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className={styles.card}>
            <h4>Teacher Profile Model</h4>
            <p className={styles.note}>
              `teachers.Teacher` is not available in the current Prisma schema. This panel is intentionally a
              placeholder to surface that schema gap.
            </p>
          </article>
        </div>
      ) : (
        <article className={styles.card}>
          <p className={styles.note}>No users available to inspect.</p>
        </article>
      )}
    </section>
  );
};
