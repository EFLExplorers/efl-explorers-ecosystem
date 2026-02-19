import { useRouter } from "next/router";

export const authHelpers = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return { handleLogin };
};
