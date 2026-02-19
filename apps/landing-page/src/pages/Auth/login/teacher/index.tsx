import { AuthContainer } from "@/components/auth/layout";
import { LoginForm } from "@/components/auth/forms";
import type { GetStaticProps } from "next";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";

interface TeacherLoginPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
}

export const TeacherLoginPage = (_props: TeacherLoginPageProps) => {
  return (
    <AuthContainer
      title="Teacher Login"
      subtitle="Welcome back to EFL Explorers"
    >
      <LoginForm platform="teacher" />
    </AuthContainer>
  );
};

export default TeacherLoginPage;

export const getStaticProps: GetStaticProps<TeacherLoginPageProps> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();
  return { props: { headerContent, footerContent }, revalidate: 300 };
};
