import { useState } from "react";
import styles from "./ContactFAQSection.module.css";
import type { PageSection } from "../../../pages/api/page-content";

export interface ContactFAQ {
  question: string;
  answer: string;
}

export interface ContactFAQSectionProps {
  section: PageSection | null;
  faqs: ContactFAQ[];
}

export const ContactFAQSection = ({ section, faqs }: ContactFAQSectionProps) => {
  if (!section) return null;
  if (!faqs?.length) return null;

  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const title = (section.content as any)?.title ?? "";
  const subtitle = (section.content as any)?.subtitle ?? "";

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  return (
    <section className={styles.section} data-cy="contact-faq-section">
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title} data-cy="contact-faq-title">
            {title}
          </h2>
          <p className={styles.subtitle} data-cy="contact-faq-subtitle">
            {subtitle}
          </p>
        </div>

        <div className={styles.faqGrid} data-cy="contact-faq-grid">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`${styles.faqItem} ${
                activeQuestion === index ? styles.active : ""
              }`}
              onClick={() => toggleQuestion(index)}
              data-cy="contact-faq-item"
            >
              <div className={styles.faqQuestion}>
                <span className={styles.questionText}>{faq.question}</span>
                <span className={styles.faqArrow}>
                  {activeQuestion === index ? "−" : "+"}
                </span>
              </div>
              {activeQuestion === index && (
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
