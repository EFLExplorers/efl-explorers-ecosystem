import { generateStaticParamsFor, importPage } from "nextra/pages";

import { useMDXComponents as getMDXComponents } from "../../mdx-components";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export const generateMetadata = async (
  props: Readonly<{ params: Promise<{ mdxPath?: string[] }> }>
) => {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  return metadata;
};

const Wrapper = getMDXComponents({}).wrapper;

export const DocsPage = async (
  props: Readonly<{ params: Promise<{ mdxPath?: string[] }> }>
) => {
  const params = await props.params;
  const { default: MDXContent, metadata, sourceCode, toc } = await importPage(
    params.mdxPath
  );

  return (
    <Wrapper metadata={metadata} toc={toc} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
};

export default DocsPage;
