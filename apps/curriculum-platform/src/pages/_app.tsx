import type { AppProps } from "next/app";

import { Providers } from "@/lib/providers";

import "@/styles/globals.css";

export const CurriculumApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Providers session={pageProps.session}>
      <Component {...pageProps} />
    </Providers>
  );
};

export default CurriculumApp;
