import type { Config } from "@babel/core";

export default function (api: { cache: (enabled: boolean) => void }): Config {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
}
