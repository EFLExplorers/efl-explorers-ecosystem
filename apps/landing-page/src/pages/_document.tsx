import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preload critical assets */}
        <link
          rel="preload"
          href="/assets/images/logo/Logo.png"
          as="image"
          type="image/png"
        />
        
        {/* Preload critical CSS */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
