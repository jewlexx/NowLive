// @ts-check

import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";
import { fixupConfigRules } from "@eslint/compat";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  // @ts-expect-error reacts fault not mine
  reactCompiler.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: { react: { version: "detect" } },
  },
  ...fixupConfigRules(
    compat.extends("plugin:react-hooks/recommended", "prettier"),
  ),
  { rules: { "react/react-in-jsx-scope": "off" } },
);
