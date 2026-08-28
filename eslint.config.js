import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Supabase Edge Functions run under Deno and intentionally bridge dynamic
    // Stripe v2/Supabase records that are not part of the browser application types.
    files: ["supabase/functions/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, Deno: "readonly" },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // shadcn/ui modules intentionally export components alongside variants/helpers.
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // The journey workspace derives memoized views from TanStack Query data and
    // supplies a local empty fallback before the first successful response.
    // The fallback's identity is intentionally irrelevant to those derived views.
    files: ["src/components/portal/PortalJourneyWorkspace.tsx"],
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    // saved_filters stores user-defined JSON payloads and is intentionally handled
    // at a dynamic serialization boundary in this legacy admin screen.
    files: ["src/routes/_authenticated/admin.leads.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // The sanitizer deliberately matches ASCII control characters to strip them
    // from URL schemes before allow-list validation.
    files: ["src/lib/sanitize-html.ts"],
    rules: {
      "no-control-regex": "off",
    },
  },
  eslintConfigPrettier,
);
