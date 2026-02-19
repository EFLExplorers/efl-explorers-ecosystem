import styles from "./Styles/Testimonials.module.css";

const Testimonials = () => {
  return (
    <section className={styles.testimonials}>
      <h2>What Our Users Say</h2>
      <div className={styles.testimonial}>
        <p>
          &quot;EFL Explorers has transformed my learning experience! The
          interactive lessons are fantastic.&quot;
        </p>
      </div>
    </section>
  );
};

export { Testimonials };
