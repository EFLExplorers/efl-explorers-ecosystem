import { AuthContainer } from "@/components/auth/layout";
import { RegistrationForm } from "@/components/auth/forms";
import type { GetStaticProps } from "next";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";

interface StudentRegistrationPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
}

export const StudentRegistrationPage = (_props: StudentRegistrationPageProps) => {
  return (
    <AuthContainer
      title="Student Registration"
      subtitle="Create your student account to get started"
    >
      <RegistrationForm platform="student" />
    </AuthContainer>
  );
};

export default StudentRegistrationPage;

export const getStaticProps: GetStaticProps<StudentRegistrationPageProps> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();
  return { props: { headerContent, footerContent }, revalidate: 300 };
};
