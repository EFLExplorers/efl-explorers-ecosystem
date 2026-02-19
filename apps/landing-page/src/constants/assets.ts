import { ASSET_PATHS } from "./paths";

export const ASSETS = {
  logo: {
    default: ASSET_PATHS.logo.default,
    dark: ASSET_PATHS.logo.dark,
  },
  characters: {
    character1: `${ASSET_PATHS.images.characters}/character1.png`,
    character2: `${ASSET_PATHS.images.characters}/character2.png`,
    // ... add more characters
  },
} as const;
