import type { NextPage } from "next";
import Head from "next/head";
import { GetStaticProps } from "next";
import { PageLayout } from "../components/layout/PageLayout";
import { ContactHeroSection } from "../components/layout/Contact/ContactHeroSection";
import { ContactFormSection } from "../components/layout/Contact/ContactFormSection";
import {
  ContactFAQSection,
  type ContactFAQ,
} from "../components/layout/Contact/ContactFAQSection";
import type { PageSection } from "./api/page-content";
import type { HeaderContent } from "../components/layout/Header-Footer/Header";
import type { FooterContent } from "../components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "../utils/globalSections";
import { prisma } from "@repo/database";
import { mapPageSectionsForProps } from "../utils/pageSectionMappers";

interface ContactPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  pageTitle: string;
  pageDescription: string;
  heroSection: PageSection | null;
  formSection: PageSection | null;
  faqSection: PageSection | null;
  faqs: ContactFAQ[];
}

export const ContactPage: NextPage<ContactPageProps> = ({
  pageTitle,
  pageDescription,
  heroSection,
  formSection,
  faqSection,
  faqs,
}) => {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="EFL contact, English learning support, language education help, contact us"
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
      </Head>
      <PageLayout>
        <ContactHeroSection section={heroSection} />
        <ContactFormSection section={formSection} />
        <ContactFAQSection section={faqSection} faqs={faqs} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps<ContactPageProps> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();

  const pageData = await prisma.page.findUnique({
    where: { route: "/contact" },
    select: { id: true, route: true, title: true, metaDescription: true },
  });

  if (!pageData?.id) {
    throw new Error(
      "[Contact] Missing pages row for route '/contact': no id"
    );
  }

  const sectionsData = await prisma.pageSection.findMany({
    where: { pageId: pageData.id, active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (!sectionsData?.length) {
    throw new Error(
      "[Contact] Missing page_sections for '/contact': none"
    );
  }

  if (!pageData.title || !pageData.metaDescription) {
    throw new Error(
      "[Contact] Missing required page fields (title, meta_description)"
    );
  }

  const pageTitle = pageData.title;
  const pageDescription = pageData.metaDescription;

  const sections = mapPageSectionsForProps(sectionsData);
  const heroSection = sections.find((s) => s.section_key === "hero") || null;
  const formSection = sections.find((s) => s.section_key === "form") || null;
  const faqSection = sections.find((s) => s.section_key === "faq") || null;

  if (!heroSection) throw new Error("[Contact] Missing hero section.");
  if (!formSection) throw new Error("[Contact] Missing form section.");
  if (!faqSection) throw new Error("[Contact] Missing faq section.");

  const faqItems = await prisma.contentItem.findMany({
    where: {
      pageId: pageData.id,
      contentType: "faq",
      active: true,
    },
    orderBy: { sortOrder: "asc" },
    select: {
      title: true,
      description: true,
      content: true,
      sortOrder: true,
      active: true,
    },
  });

  if (!faqItems || faqItems.length === 0) {
    throw new Error("[Contact] Missing FAQ items.");
  }

  type ContactFaqItem = {
    title: string | null;
    description: string | null;
  };

  const faqs: ContactFAQ[] = faqItems.map((item: ContactFaqItem) => {
    if (!item.title || !item.description) {
      throw new Error(
        "[Contact] FAQ item missing required fields (title, description)"
      );
    }
    return {
      question: item.title,
      answer: item.description,
    };
  });

  if (!faqs.length) throw new Error("[Contact] Missing FAQ items.");

  return {
    props: {
      headerContent,
      footerContent,
      pageTitle,
      pageDescription,
      heroSection,
      formSection,
      faqSection,
      faqs,
    },
  };
};

export default ContactPage;
