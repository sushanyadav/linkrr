module.exports = {
  ignorePatterns: ["node_modules", ".next", "public", "src/assets"],
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "google",
    "next",
    "next/core-web-vitals",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "plugin:import/react",
    "plugin:import/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "import", "prettier"],
  rules: {
    "new-cap": 0,
    "no-console": ["warn", { allow: ["warn"] }],

    //* disables js doc
    "require-jsdoc": 0,

    //* disables react imports
    "react/react-in-jsx-scope": "off",

    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
      {
        blankLine: "any",
        prev: ["const", "let", "var"],
        next: ["const", "let", "var"],
      },
    ],

    //* import config
    "import/order": [
      "warn",
      {
        pathGroups: [
          {
            pattern: "components/**",
            group: "external",
            position: "after",
          },
          {
            pattern: "hooks/**",
            group: "external",
            position: "after",
          },
          {
            pattern: "scrollTriggerAnimations/**",
            group: "external",
            position: "after",
          },
          {
            pattern: "utils/**",
            group: "external",
            position: "after",
          },
          {
            pattern: "assets/**",
            group: "external",
            position: "after",
          },
          {
            pattern: "constants/**",
            group: "external",
            position: "after",
          },
        ],
        "newlines-between": "always",
      },
    ],

    //* prettier config
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto",
        singleQuote: false,
        printWidth: 80,
        tabWidth: 2,
        trailingComma: "es5",
      },
    ],
  },
  settings: {
    "import/resolver": {
      node: {
        paths: ["src"],
        extensions: [".js", ".jsx"],
      },
    },
    react: {
      version: "latest",
    },
  },
};
