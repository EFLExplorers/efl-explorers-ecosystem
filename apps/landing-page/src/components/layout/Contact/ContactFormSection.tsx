import { useState } from "react";
import styles from "./ContactFormSection.module.css";
import type { PageSection } from "../../../pages/api/page-content";

export interface ContactFormSectionProps {
  section: PageSection | null;
}

export const ContactFormSection = ({ section }: ContactFormSectionProps) => {
  if (!section) return null;

  const content = section.content as any;
  if (!content.form_labels) {
    throw new Error("[ContactFormSection] Missing form_labels in section content");
  }

  const formLabels = content.form_labels;
  if (
    !formLabels.first_name ||
    !formLabels.last_name ||
    !formLabels.email ||
    !formLabels.subject ||
    !formLabels.message ||
    !formLabels.submit_button ||
    !formLabels.select_subject
  ) {
    throw new Error(
      "[ContactFormSection] Missing required form label fields in section content"
    );
  }

  const title = content.title ?? "";
  const subtitle = content.subtitle ?? "";
  const subjectOptions = (content.subject_options as string[] | undefined) || [];
  const firstNameLabel = formLabels.first_name;
  const lastNameLabel = formLabels.last_name;
  const emailLabel = formLabels.email;
  const subjectLabel = formLabels.subject;
  const messageLabel = formLabels.message;
  const submitButtonLabel = formLabels.submit_button;
  const selectSubjectPlaceholder = formLabels.select_subject;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  return (
    <section className={styles.section} data-cy="contact-form-section">
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title} data-cy="contact-form-title">
            {title}
          </h2>
          <p className={styles.subtitle} data-cy="contact-form-subtitle">
            {subtitle}
          </p>
        </div>

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.label}>
                  {firstNameLabel}
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  data-cy="contact-first-name"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>
                  {lastNameLabel}
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  data-cy="contact-last-name"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                {emailLabel}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                required
                data-cy="contact-email-input"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject" className={styles.label}>
                {subjectLabel}
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={styles.select}
                required
                data-cy="contact-subject"
              >
                <option value="">{selectSubjectPlaceholder}</option>
                {subjectOptions.map((option) => (
                  <option
                    key={option}
                    value={option.toLowerCase().replace(/\s+/g, "-")}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>
                {messageLabel}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className={styles.textarea}
                required
                data-cy="contact-message"
              ></textarea>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              data-cy="contact-submit"
            >
              {submitButtonLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
