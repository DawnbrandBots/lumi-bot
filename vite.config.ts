import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    // Required for globatSetup files to have access to env variables
    Object.assign(process.env, env);

    return {
        test: {
            env,
            // TODO: "fileParallelism: false" could be a sign that some refactoring is needed at the data access level
            fileParallelism: false,
            globalSetup: ["./test/globalSetup.ts"],
        },
    };
});
