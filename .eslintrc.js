module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "@nuxtjs/eslint-config-typescript",
    "prettier",
    "prettier/vue",
    "plugin:prettier/recommended",
    "plugin:nuxt/recommended",
  ],
  plugins: ["prettier"],
  // add your custom rules here
  rules: {
    "no-unused-vars": "off",
    "no-use-before-define": "off",
    "require-await": "off",
  },
  overrides: [
    {
      files: ["**/*.ts"],
      rules: {
        "no-undef": "off",
      },
    },
    {
      files: ["index.js", "src/main.ts"],
      rules: {
        "no-console": "off",
      },
    },
    {
      files: ["src/store/*.ts"],
      rules: {
        camelcase: "off",
      },
    },
  ],
  ignorePatterns: ["sample/*"],
};
