import type { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import recreateDb from "../../scripts/utils/recreateDb.ts";
import { AdminFeature } from "../../src/admin/feature.ts";
import { GuildConfig } from "../../src/admin/models/config.ts";
import { EAdminFeatureReturnKind } from "../../src/admin/types.ts";
import getOrm from "../../src/loaders/orm.ts";
import { configsById } from "../mikro-orm.test.config.ts";

const GUILD_ID = "guild-1";
const CHANNEL_ID = "channel-1";
const ROLE_ID = "role-1";

let orm: MikroORM;
let feature: AdminFeature;

async function getStoredConfig(): Promise<GuildConfig | null> {
    return orm.em.fork().findOne(GuildConfig, { guild: GUILD_ID });
}

describe(AdminFeature.name, () => {
    beforeEach(async () => {
        await recreateDb(configsById.lumi);
        orm = await getOrm(configsById.lumi);
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
        await feature.lfgRole(GUILD_ID, "set", ROLE_ID);
        await feature.setLfgRoleLastPingedAt(GUILD_ID, new Date("2026-06-16T10:00:00.000Z"));

        const result = await feature.getGuildConfig(GUILD_ID);

        expect(result.kind).toBe(EAdminFeatureReturnKind.LFG_GET_CONFIG);
        expect(result.value?.lfgChannel).toBe(CHANNEL_ID);
        expect(result.value?.lfgRole).toBe(ROLE_ID);
        expect(result.value?.lfgRoleLastPingedAt).toBe("2026-06-16T10:00:00.000Z");
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

    test("sets role", async () => {
        const result = await feature.lfgRole(GUILD_ID, "set", ROLE_ID);

        expect(result).toEqual({
            kind: EAdminFeatureReturnKind.LFG_ROLE_SET,
            value: { role: ROLE_ID },
        });
        expect((await getStoredConfig())?.lfgRole).toBe(ROLE_ID);
    });

    test("clears role", async () => {
        await feature.lfgRole(GUILD_ID, "set", ROLE_ID);

        const result = await feature.lfgRole(GUILD_ID, "clear", null);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_CLEARED });
        expect((await getStoredConfig())?.lfgRole).toBeNull();
    });

    test("role command without options explains the setting and shows current value", async () => {
        const result = await feature.lfgRole(GUILD_ID, null, null);

        expect(result).toEqual({
            kind: EAdminFeatureReturnKind.LFG_ROLE_HELP,
            value: { role: null },
        });
    });

    test("rejects set without role", async () => {
        const result = await feature.lfgRole(GUILD_ID, "set", null);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE });
    });

    test("rejects clear with role", async () => {
        const result = await feature.lfgRole(GUILD_ID, "clear", ROLE_ID);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS });
    });

    test("rejects role without set action", async () => {
        const result = await feature.lfgRole(GUILD_ID, null, ROLE_ID);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS });
    });
});
