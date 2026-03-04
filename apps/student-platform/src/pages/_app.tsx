import type { AppProps } from "next/app";
import "@/styles/globals.css";

export const StudentsApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default StudentsApp;
