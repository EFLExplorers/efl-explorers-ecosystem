import { QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

import { queryClient } from "@/lib/queryClient";

type ProvidersProps = {
  readonly children: ReactNode;
  readonly session?: Session | null;
};

export const Providers = ({ children, session }: ProvidersProps) => {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
};
