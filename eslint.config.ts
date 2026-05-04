import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    {
        files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.node },
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
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
    },
    eslintConfigPrettier,
]);
