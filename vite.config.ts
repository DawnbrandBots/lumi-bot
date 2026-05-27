import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    // Require for globatSetup files to have access to env variables
    Object.assign(process.env, env);

    return {
        test: {
            env,
            globalSetup: ["./test/globalSetup.ts"],
        },
    };
});
