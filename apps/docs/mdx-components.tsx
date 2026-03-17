import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import { DoDont } from "./components/DoDont";
import { PropsTable } from "./components/PropsTable";

export const useMDXComponents = (components: Record<string, unknown>) => {
  return {
    ...getThemeComponents(),
    DoDont,
    PropsTable,
    ...components,
  };
};
