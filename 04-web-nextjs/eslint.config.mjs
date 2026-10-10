import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "views", pattern: "src/views/*" },
        { type: "widgets", pattern: "src/widgets/*" },
        { type: "features", pattern: "src/features/*" },
        { type: "entities", pattern: "src/entities/*" },
        { type: "shared", pattern: "src/shared/*" },
      ],
      "import/resolver": {
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "app" } },
              allow: {
                to: [
                  { element: { type: "views" } },
                  { element: { type: "widgets" } },
                  { element: { type: "features" } },
                  { element: { type: "entities" } },
                  { element: { type: "shared" } },
                ],
              },
            },
            {
              from: { element: { type: "views" } },
              allow: {
                to: [
                  { element: { type: "widgets" } },
                  { element: { type: "features" } },
                  { element: { type: "entities" } },
                  { element: { type: "shared" } },
                ],
              },
            },
            {
              from: { element: { type: "widgets" } },
              allow: {
                to: [
                  { element: { type: "features" } },
                  { element: { type: "entities" } },
                  { element: { type: "shared" } },
                ],
              },
            },
            {
              from: { element: { type: "features" } },
              allow: {
                to: [{ element: { type: "entities" } }, { element: { type: "shared" } }],
              },
            },
            {
              from: { element: { type: "entities" } },
              allow: {
                to: [{ element: { type: "entities" } }, { element: { type: "shared" } }],
              },
            },
            {
              from: { element: { type: "shared" } },
              allow: { to: [{ element: { type: "shared" } }] },
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
