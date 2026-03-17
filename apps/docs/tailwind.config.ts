import type { Config } from "tailwindcss";
import sharedTailwindConfig from "../../tailwind.config.js";

const config = {
  presets: [sharedTailwindConfig],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
} satisfies Config;

export default config;
