import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Development-friendly rules for components in active development
      "@typescript-eslint/no-explicit-any": "warn", // Allow any during development but warn
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }], // Warn for unused vars, allow underscore prefix
      
      // React development rules
      "react/display-name": "off", // Allow anonymous components during development
      "react/no-unescaped-entities": "warn", // Warn but don't error on quotes
      "react-hooks/exhaustive-deps": "warn", // Warn for missing deps instead of error
      
      // Next.js development rules  
      "@next/next/no-img-element": "warn", // Warn about img vs Image
      "@next/next/no-assign-module-variable": "off", // Allow module assignments for dynamic imports
      
      // Allow console in development but warn in production
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      
      // Relax some strict rules for active development
      "@typescript-eslint/ban-ts-comment": "warn", // Allow @ts-ignore with warning
      "@typescript-eslint/prefer-as-const": "warn",
      
      // Keep important rules as errors
      "@typescript-eslint/no-unused-expressions": "error",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];

export default eslintConfig;
