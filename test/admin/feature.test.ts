import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { AdminFeature } from "../../src/admin/feature.ts";
import { GuildConfig } from "../../src/admin/models/config.ts";
import { EAdminFeatureReturnKind } from "../../src/admin/types.ts";
import { migrationMikroOrmConfig } from "../mikro-orm.test.config.ts";
import getSameConfigInMemory from "../utils/getSameConfigInMemory.ts";

const GUILD_ID = "guild-1";
const CHANNEL_ID = "channel-1";

let orm: MikroORM;
let feature: AdminFeature;

function getStoredConfig(): Promise<GuildConfig | null> {
    return orm.em.fork().findOne(GuildConfig, { guild: GUILD_ID });
}

const config = getSameConfigInMemory(migrationMikroOrmConfig);

// Tests recreate dbs. Simultaneous recreations cause errors. Therefore `concurrent: false`.
describe(AdminFeature.name, { concurrent: false }, () => {
    beforeEach(async () => {
        orm = await MikroORM.init(config);
        await orm.schema.create();
        feature = new AdminFeature({ em: orm.em.fork() });
    });

    afterEach(async () => {
        await orm.close(true);
    });

    test("returns null when config is missing", async () => {
        const result = await feature.getGuildConfig(GUILD_ID);

        expect(result).toEqual({
            kind: EAdminFeatureReturnKind.LFG_GET_CONFIG,
            value: null,
        });
        expect(await getStoredConfig()).toBeNull();
    });

    test("returns existing config on read", async () => {
        await feature.lfgChannel(GUILD_ID, "set", CHANNEL_ID);

        const result = await feature.getGuildConfig(GUILD_ID);

        expect(result.kind).toBe(EAdminFeatureReturnKind.LFG_GET_CONFIG);
        expect(result.value?.lfgChannel).toBe(CHANNEL_ID);
    });

    test("sets channel", async () => {
        const result = await feature.lfgChannel(GUILD_ID, "set", CHANNEL_ID);

        expect(result).toEqual({
            kind: EAdminFeatureReturnKind.LFG_CHANNEL_SET,
            value: { channel: CHANNEL_ID },
        });
        expect((await getStoredConfig())?.lfgChannel).toBe(CHANNEL_ID);
    });

    test("clears channel", async () => {
        await feature.lfgChannel(GUILD_ID, "set", CHANNEL_ID);

        const result = await feature.lfgChannel(GUILD_ID, "clear", null);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED });
        expect((await getStoredConfig())?.lfgChannel).toBeNull();
    });

    test("channel command without options explains the setting and shows current value", async () => {
        const result = await feature.lfgChannel(GUILD_ID, null, null);

        expect(result).toEqual({
            kind: EAdminFeatureReturnKind.LFG_CHANNEL_HELP,
            value: { channel: null },
        });
    });

    test("rejects set without channel", async () => {
        const result = await feature.lfgChannel(GUILD_ID, "set", null);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_CHANNEL_MISSING_CHANNEL });
    });

    test("rejects clear with channel", async () => {
        const result = await feature.lfgChannel(GUILD_ID, "clear", CHANNEL_ID);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS });
    });

    test("rejects channel without set action", async () => {
        const result = await feature.lfgChannel(GUILD_ID, null, CHANNEL_ID);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS });
    });
});
