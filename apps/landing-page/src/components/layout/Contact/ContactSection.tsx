import { useState } from "react";
import styles from "./ContactSection.module.css";
import { MapPin, Mail, Phone, ChevronRight } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

export const ContactSection = () => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: "What types of English courses do you offer?",
      answer:
        "We offer a wide range of English courses including General English, Business English, IELTS Preparation, TOEFL Preparation, and Conversational English. Our courses cater to all proficiency levels from beginner to advanced.",
    },
    {
      question: "How are the lessons structured?",
      answer:
        "Each lesson is 60 minutes long and includes interactive activities, real-world examples, and practical exercises. Our curriculum follows a communicative approach with focus on speaking, listening, reading, and writing skills.",
    },
    {
      question: "What resources do teachers use?",
      answer:
        "Our teachers use a combination of modern textbooks, multimedia materials, authentic content, and our proprietary digital learning platform. All materials are regularly updated to ensure relevance and effectiveness.",
    },
    {
      question: "How many lessons can I take per week?",
      answer:
        "You can choose from flexible scheduling options ranging from 1 to 5 lessons per week. We recommend at least 2-3 lessons per week for optimal learning progress.",
    },
    {
      question: "What types of activities are included?",
      answer:
        "Our lessons include role-plays, discussions, pronunciation practice, grammar exercises, vocabulary building, and cultural exchange activities. We also incorporate games and multimedia content to make learning engaging.",
    },
    {
      question: "Do you offer exam preparation courses?",
      answer:
        "Yes, we specialize in preparation courses for IELTS, TOEFL, Cambridge exams, and other international English proficiency tests. Our teachers are experienced in exam strategies and techniques.",
    },
    {
      question: "How can I access the course content?",
      answer:
        "All course materials are available through our online learning platform. You can access them 24/7 from any device with an internet connection. We also provide downloadable resources for offline study.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply fill out the contact form above or reach out to us through email or phone. We'll schedule a free consultation to assess your level and discuss your learning goals.",
    },
  ];

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  return (
    <section className={styles.contact}>
      <div className={styles.container}>
        <h1 className={styles.title}>Contact Us</h1>

        <div className={styles.content}>
          {/* Contact Details */}
          <div className={styles.contactDetails}>
            <p className={styles.contactText}>
              Have questions about our English learning programs? We&apos;re
              here to help! Reach out to us through any of the following
              channels or fill out the contact form.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <MapPin className={styles.icon} />
                <span>123 Learning Street, Education City, EC 12345</span>
              </div>
              <div className={styles.infoItem}>
                <Mail className={styles.icon} />
                <a href="mailto:contact@eflexplorers.com">
                  contact@eflexplorers.com
                </a>
              </div>
              <div className={styles.infoItem}>
                <Phone className={styles.icon} />
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.contactForm}>
            <form>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" name="firstName" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" name="lastName" required />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" required>
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="courses">Course Information</option>
                  <option value="pricing">Pricing</option>
                  <option value="technical">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                ></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`${styles.faqItem} ${
                  activeQuestion === index ? styles.active : ""
                }`}
                onClick={() => toggleQuestion(index)}
              >
                <div className={styles.faqQuestion}>
                  <span>{faq.question}</span>
                  <ChevronRight className={styles.faqArrow} />
                </div>
                {activeQuestion === index && (
                  <div className={styles.faqAnswer}>{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
