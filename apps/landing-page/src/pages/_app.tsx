import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Layout } from "../components/layout/Layout";
import type { HeaderContent } from "../components/layout/Header-Footer/Header";
import type { FooterContent } from "../components/layout/Header-Footer/Footer";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

type AppPageProps = {
  headerContent?: HeaderContent | null;
  footerContent?: FooterContent | null;
  session?: Session | null;
  [key: string]: any;
};

function App({ Component, pageProps }: AppProps<AppPageProps>) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="EFL Explorers - Learning Platform" />
        <title>EFL Explorers</title>
      </Head>
      <SessionProvider session={pageProps.session ?? null}>
        <Layout
          headerContent={pageProps.headerContent ?? null}
          footerContent={pageProps.footerContent ?? null}
        >
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </>
  );
}

export default App;
