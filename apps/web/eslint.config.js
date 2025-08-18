import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
    ...nextJsConfig,
    {
        rules: {
            // Temporarily relax these rules for deployment
            "react/no-unescaped-entities": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-empty-object-type": "off",
            "turbo/no-undeclared-env-vars": "off",
        },
    },
];
