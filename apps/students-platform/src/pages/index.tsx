import Head from "next/head";
import styles from "./home.module.css";

export const StudentsHomePage = () => {
  return (
    <>
      <Head>
        <title>Students Platform</title>
        <meta
          name="description"
          content="Starter boilerplate for the EFL Explorers Students Platform."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Students Platform Boilerplate</h1>
          <p className={styles.description}>
            The app is set up with Next.js, TypeScript, ESLint, and CSS
            modules.
          </p>
          <ul className={styles.list}>
            <li>Edit this page at `src/pages/index.tsx`</li>
            <li>Add reusable UI in `src/components`</li>
            <li>Run `pnpm --filter students-platform dev` to start</li>
          </ul>
        </section>
      </main>
    </>
  );
};

export default StudentsHomePage;
