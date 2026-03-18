import { getServerSession } from "next-auth/next";
import type { GetServerSideProps } from "next";

import { authOptions } from "@/lib/authOptions";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session?.user?.id) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};

export const HomePage = () => null;

export default HomePage;
