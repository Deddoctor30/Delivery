const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier");
const boundaries = require("eslint-plugin-boundaries");

module.exports = defineConfig([
  expoConfig,
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
  {
    files: ["**/*.{test,spec}.{ts,tsx}", "jest.setup.ts"],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
  },
  { ignores: ["dist/*", ".expo/*"] },
]);
