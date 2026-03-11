import Head from "next/head";
import { useMemo, useState } from "react";

import { StudentLayout } from "@/components/student/shell/StudentLayout";
import { MOCK_STUDENT_PORTAL_DATA } from "@/lib/mock/student-portal-data";

import styles from "./settings.module.css";

type SettingsTab = "profile" | "learning" | "notifications" | "safety" | "appearance";

const SETTINGS_TABS: readonly SettingsTab[] = [
  "profile",
  "learning",
  "notifications",
  "safety",
  "appearance",
];

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabContent = useMemo(() => {
    if (activeTab === "profile") {
      return (
        <section className={styles.grid}>
          <article className={`${styles.card} ${styles.full}`}>
            <h2 className={styles.cardTitle}>Profile and class details</h2>
            <p className={styles.cardText}>
              Keep student details accurate so teacher sessions can stay focused.
            </p>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Student name</span>
                <input className={styles.input} defaultValue={MOCK_STUDENT_PORTAL_DATA.student.name} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Level</span>
                <input className={styles.input} defaultValue={MOCK_STUDENT_PORTAL_DATA.student.levelLabel} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Planet</span>
                <input className={styles.input} defaultValue={MOCK_STUDENT_PORTAL_DATA.student.planetLabel} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Assigned teacher</span>
                <input className={styles.input} defaultValue={MOCK_STUDENT_PORTAL_DATA.teacher.name} />
              </label>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.buttonPrimary}>Save profile</button>
              <button type="button" className={styles.buttonGhost}>Reset changes</button>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Parent contact</h2>
            <p className={styles.cardText}>Used for reminders and progress summaries.</p>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Parent name</span>
                <input className={styles.input} defaultValue="Alex Carter" />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Parent email</span>
                <input className={styles.input} defaultValue="alex@example.com" />
              </label>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Learning mode</h2>
            <p className={styles.cardText}>Choose how this account receives tasks.</p>
            <label className={styles.field}>
              <span className={styles.label}>Mode</span>
              <select className={styles.select} defaultValue={MOCK_STUDENT_PORTAL_DATA.student.mode}>
                <option value="teacher-led">Teacher-led</option>
                <option value="parent-led">Parent-led</option>
              </select>
            </label>
          </article>
        </section>
      );
    }

    if (activeTab === "learning") {
      return (
        <section className={styles.grid}>
          <article className={`${styles.card} ${styles.full}`}>
            <h2 className={styles.cardTitle}>Learning preferences</h2>
            <p className={styles.cardText}>
              Tune activity style, class pacing, and lesson aids for better outcomes.
            </p>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Class pace</span>
                <select className={styles.select} defaultValue="balanced">
                  <option value="slow">Slow and guided</option>
                  <option value="balanced">Balanced</option>
                  <option value="fast">Fast challenge</option>
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Support style</span>
                <select className={styles.select} defaultValue="mixed">
                  <option value="visual">Visual first</option>
                  <option value="audio">Audio first</option>
                  <option value="mixed">Mixed support</option>
                </select>
              </label>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Practice goals</h2>
            <div className={styles.toggleList}>
              <label className={styles.toggleItem}>
                <div>
                  <p className={styles.toggleInfo}>Daily 10-minute mission</p>
                  <p className={styles.toggleSub}>Auto-suggest a short activity every day.</p>
                </div>
                <input className={styles.checkbox} type="checkbox" defaultChecked />
              </label>
              <label className={styles.toggleItem}>
                <div>
                  <p className={styles.toggleInfo}>Speaking confidence boost</p>
                  <p className={styles.toggleSub}>Prioritize oral response activities.</p>
                </div>
                <input className={styles.checkbox} type="checkbox" defaultChecked />
              </label>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Assist tools</h2>
            <div className={styles.toggleList}>
              <label className={styles.toggleItem}>
                <div>
                  <p className={styles.toggleInfo}>Slow mode icon</p>
                  <p className={styles.toggleSub}>Keep slow playback available.</p>
                </div>
                <input className={styles.checkbox} type="checkbox" defaultChecked />
              </label>
              <label className={styles.toggleItem}>
                <div>
                  <p className={styles.toggleInfo}>Repeat prompt icon</p>
                  <p className={styles.toggleSub}>Allow repeating teacher prompts quickly.</p>
                </div>
                <input className={styles.checkbox} type="checkbox" defaultChecked />
              </label>
            </div>
          </article>
        </section>
      );
    }

    if (activeTab === "notifications") {
      return (
        <section className={styles.grid}>
          <article className={`${styles.card} ${styles.full}`}>
            <h2 className={styles.cardTitle}>Notification controls</h2>
            <p className={styles.cardText}>
              Decide which updates should go to student and parent accounts.
            </p>
            <div className={styles.toggleList}>
              <label className={styles.toggleItem}>
                <div>
                  <p className={styles.toggleInfo}>Upcoming class reminders</p>
                  <p className={styles.toggleSub}>Send 30-minute reminder before live class.</p>
                </div>
                <input className={styles.checkbox} type="checkbox" defaultChecked />
              </label>
              <label className={styles.toggleItem}>
                <div>
                  <p className={styles.toggleInfo}>Assignment due alerts</p>
                  <p className={styles.toggleSub}>Notify when delegated tasks approach deadline.</p>
                </div>
                <input className={styles.checkbox} type="checkbox" defaultChecked />
              </label>
              <label className={styles.toggleItem}>
                <div>
                  <p className={styles.toggleInfo}>Progress summary digest</p>
                  <p className={styles.toggleSub}>Weekly summary for parent and teacher.</p>
                </div>
                <input className={styles.checkbox} type="checkbox" defaultChecked />
              </label>
            </div>
          </article>
        </section>
      );
    }

    if (activeTab === "safety") {
      return (
        <section className={styles.grid}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Session controls</h2>
            <p className={styles.cardText}>Review active devices and secure access.</p>
            <div className={styles.actions}>
              <button type="button" className={styles.buttonGhost}>Sign out other devices</button>
              <button type="button" className={styles.buttonPrimary}>Update student pin</button>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Teacher access</h2>
            <p className={styles.cardText}>Only verified teachers can assign live class tasks.</p>
            <div className={styles.toggleList}>
              <label className={styles.toggleItem}>
                <div>
                  <p className={styles.toggleInfo}>Require verified teacher</p>
                  <p className={styles.toggleSub}>Prevent assignment from unverified profiles.</p>
                </div>
                <input className={styles.checkbox} type="checkbox" defaultChecked />
              </label>
            </div>
          </article>

          <article className={`${styles.card} ${styles.full}`}>
            <h2 className={styles.cardTitle}>Recent sessions</h2>
            <div className={styles.session}>
              <p className={styles.sessionTitle}>Current session - Chrome on Windows</p>
              <p className={styles.sessionMeta}>Active now • Student dashboard</p>
            </div>
            <div className={styles.session}>
              <p className={styles.sessionTitle}>Parent review session - Mobile Safari</p>
              <p className={styles.sessionMeta}>Last active 2 days ago</p>
            </div>
          </article>
        </section>
      );
    }

    return (
      <section className={styles.grid}>
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Theme</h2>
          <p className={styles.cardText}>Choose the app theme for focus and readability.</p>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Theme mode</span>
              <select className={styles.select} defaultValue="light">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </label>
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>UI density</h2>
          <p className={styles.cardText}>Adjust spacing for younger learners or compact review.</p>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Layout density</span>
              <select className={styles.select} defaultValue="comfortable">
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </label>
          </div>
        </article>
      </section>
    );
  }, [activeTab]);

  return (
    <>
      <Head>
        <title>Student Settings</title>
      </Head>
      <StudentLayout
        title="Settings"
        description="Manage student profile, learning preferences, notifications, and safety."
        learnerName={MOCK_STUDENT_PORTAL_DATA.student.name}
        learningMode={MOCK_STUDENT_PORTAL_DATA.student.mode}
      >
        <section className={styles.container}>
          <header className={styles.header}>
            <h2 className={styles.title}>Student Settings Hub</h2>
            <p className={styles.subtitle}>
              Similar structure to teacher settings, adapted for student and parent flow.
            </p>
          </header>

          <div className={styles.tabs} role="tablist" aria-label="Student settings tabs">
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab)}
                  className={isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}
          </div>

          {tabContent}
        </section>
      </StudentLayout>
    </>
  );
};

export default SettingsPage;
