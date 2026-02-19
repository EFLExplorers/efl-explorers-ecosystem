import { AuthContainer } from "@/components/auth/layout";
import { LoginForm } from "@/components/auth/forms";
import type { GetStaticProps } from "next";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";

interface StudentLoginPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
}

export const StudentLoginPage = (_props: StudentLoginPageProps) => {
  return (
    <AuthContainer
      title="Student Login"
      subtitle="Welcome back to EFL Explorers"
    >
      <LoginForm platform="student" />
    </AuthContainer>
  );
};

export default StudentLoginPage;

export const getStaticProps: GetStaticProps<StudentLoginPageProps> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();
  return { props: { headerContent, footerContent }, revalidate: 300 };
};
