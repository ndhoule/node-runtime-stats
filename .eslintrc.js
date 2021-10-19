module.exports = {
  root: true,
  extends: [
    "@ndhoule/eslint-config/recommended",
    "@ndhoule/eslint-config/node",
  ],
  overrides: [
    {
      files: ["src/**/*.ts"],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
        sourceType: "module",
      },
      extends: [
        "@ndhoule/eslint-config/typescript",
        "@ndhoule/eslint-config/node/typescript",
      ],
    },
    {
      files: ["src/**/*.test.ts"],
      extends: ["@ndhoule/eslint-config/jest"],
    },
  ],
};
