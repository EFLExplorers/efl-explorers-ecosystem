import { AuthContainer } from "@/components/auth/layout";
import { RegistrationForm } from "@/components/auth/forms";
import type { GetServerSideProps } from "next";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";

interface TeacherRegistrationPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
}

export const TeacherRegistrationPage = (_props: TeacherRegistrationPageProps) => {
  return (
    <AuthContainer
      title="Teacher Registration"
      subtitle="Create your teacher account to get started"
    >
      <RegistrationForm platform="teacher" />
    </AuthContainer>
  );
};

export default TeacherRegistrationPage;

export const getServerSideProps: GetServerSideProps<
  TeacherRegistrationPageProps
> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();
  return { props: { headerContent, footerContent } };
};
