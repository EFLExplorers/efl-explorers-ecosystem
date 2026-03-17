import { Html, Head, Main, NextScript } from "next/document";

const APPEARANCE_SCRIPT = `
(function() {
  var theme = localStorage.getItem('efl.teacher.appearance.theme');
  var color = localStorage.getItem('efl.teacher.appearance.color');
  var validTheme = theme === 'light' || theme === 'dark' || theme === 'system';
  var validColor = color === 'purple' || color === 'blue' || color === 'green' || color === 'orange';
  var resolved = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : (validTheme ? theme : 'dark');
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.color = validColor ? color : 'purple';
})();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_SCRIPT }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
