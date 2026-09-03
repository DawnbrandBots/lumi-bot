import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const checkedFiles = ["eslint.config.ts", "{scripts,src,test}/**/*.{js,mjs,cjs,ts,mts,cts}"];

export default defineConfig(
    {
        ignores: ["**/*", "!eslint.config.ts", "!scripts", "!scripts/**/*", "!src", "!src/**/*", "!test", "!test/**/*"],
    },
    {
        files: checkedFiles,
        extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    // Feels like using async callbacks is too common to be considered an error.
                    // Example: discord.js event handlers being async to call the search feature without .then() or IIFE
                    checksVoidReturn: false,
                },
            ],
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/switch-exhaustiveness-check": [
                "error",
                { allowDefaultCaseForExhaustiveSwitch: true, considerDefaultExhaustiveForUnions: true },
            ],
        },
    },
    /**
     * https://typescript-eslint.io/getting-started/typed-linting/
     *
     * You might also need to update your IDE's settings with options:
     *
     * ```
     * "eslint.options": {
     *     "flags": ["unstable_native_nodejs_ts_config"]
     * },
     * "eslint.execArgv": ["--experimental-strip-types"],
     * ```
     */
    { ...eslintConfigPrettier, files: checkedFiles },
    {
        files: ["src/domain/**/*.{js,mjs,cjs,ts,mts,cts}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            regex: "^.*(?:application|composition|infrastructure|presentation)/.*$",
                            message: "Domain code must not depend on outer layers.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/application/**/*.{js,mjs,cjs,ts,mts,cts}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            regex: "^.*(?:composition|infrastructure|presentation)/.*$",
                            message:
                                "Application code must not depend on composition, infrastructure, or presentation.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/infrastructure/**/*.{js,mjs,cjs,ts,mts,cts}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            regex: "^.*(?:composition|presentation)/.*$",
                            message: "Infrastructure code must not depend on composition or presentation.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/presentation/**/*.{js,mjs,cjs,ts,mts,cts}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            regex: "^.*(?:composition|infrastructure)/.*$",
                            message: "Presentation code must not depend on composition or infrastructure.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/utils/**/*.{js,mjs,cjs,ts,mts,cts}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            regex: "^.*(?:application|composition|domain|infrastructure|presentation)/.*$",
                            message: "Generic utilities must not depend on application-specific layers.",
                        },
                    ],
                },
            ],
        },
    },
);
