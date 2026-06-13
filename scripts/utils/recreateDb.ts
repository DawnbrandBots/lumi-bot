import type { Options } from "@mikro-orm/sqlite";
import fs from "node:fs";
import updateDb from "./updateDb.ts";

function getDbNames(configs: Options[]): string[] {
    return [
        ...configs.flatMap((config) => config.dbName ?? []),
        ...configs.flatMap((config) => (config.attachDatabases ?? []).map((attachedDatabase) => attachedDatabase.path)),
    ];
}

export default async function recreateDb({
    appConfig,
    migrationConfig,
    staticGameDataConfig,
}: {
    readonly appConfig: Options;
    readonly migrationConfig: Options;
    readonly staticGameDataConfig: Options;
}): Promise<void> {
    if (!appConfig.dbName) {
        throw new Error("dbName required");
    }

    for (const dbName of new Set(getDbNames([appConfig, migrationConfig, staticGameDataConfig]))) {
        if (fs.existsSync(dbName)) {
            fs.unlinkSync(dbName);
        }
    }

    await updateDb({ appConfig, migrationConfig, staticGameDataConfig });
}
