import type { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import recreateDb from "../../scripts/utils/recreateDb.ts";
import { ADMIN_LFG_ROLE_LIMIT } from "../../src/admin/constants.ts";
import { AdminFeature } from "../../src/admin/feature.ts";
import { GuildConfig } from "../../src/admin/models/config.ts";
import { GuildConfigLfgRole } from "../../src/admin/models/configLfgRole.ts";
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

async function getStoredRoles(): Promise<GuildConfigLfgRole[]> {
    return orm.em.fork().find(GuildConfigLfgRole, { guildConfig: { guild: GUILD_ID } }, { orderBy: { role: "asc" } });
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
        await feature.lfgRole(GUILD_ID, "add", ROLE_ID);
        await feature.setLfgRoleLastPingedAt(GUILD_ID, ROLE_ID, new Date("2026-06-16T10:00:00.000Z"));

        const result = await feature.getGuildConfig(GUILD_ID);
        const roleConfig = await feature.getLfgRoleConfig(GUILD_ID, ROLE_ID);

        expect(result.kind).toBe(EAdminFeatureReturnKind.LFG_GET_CONFIG);
        expect(result.value?.lfgChannel).toBe(CHANNEL_ID);
        expect(result.value?.lfgRoles.toArray().map((lfgRole) => lfgRole.role)).toEqual([ROLE_ID]);
        expect(roleConfig).toMatchObject({
            kind: EAdminFeatureReturnKind.LFG_GET_ROLE_CONFIG,
            value: { role: ROLE_ID, lastPingedAt: "2026-06-16T10:00:00.000Z" },
        });
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

    test("sets role ping cooldown", async () => {
        const result = await feature.lfgRolePingCooldown(GUILD_ID, "set", 45);

        expect(result).toEqual({
            kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_SET,
            value: { minutes: 45 },
        });
        expect((await getStoredConfig())?.lfgRolePingCooldownMinutes).toBe(45);
    });

    test("clears role ping cooldown", async () => {
        await feature.lfgRolePingCooldown(GUILD_ID, "set", 45);

        const result = await feature.lfgRolePingCooldown(GUILD_ID, "clear", null);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_CLEARED });
        expect((await getStoredConfig())?.lfgRolePingCooldownMinutes).toBeNull();
    });

    test("role ping cooldown command without options explains the setting and shows current value", async () => {
        const result = await feature.lfgRolePingCooldown(GUILD_ID, null, null);

        expect(result).toEqual({
            kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_HELP,
            value: { minutes: null },
        });
    });

    test("rejects set role ping cooldown without minutes", async () => {
        const result = await feature.lfgRolePingCooldown(GUILD_ID, "set", null);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_MISSING_MINUTES });
    });

    test("rejects clear role ping cooldown with minutes", async () => {
        const result = await feature.lfgRolePingCooldown(GUILD_ID, "clear", 45);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_INVALID_OPTIONS });
    });

    test("rejects role ping cooldown minutes without set action", async () => {
        const result = await feature.lfgRolePingCooldown(GUILD_ID, null, 45);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_INVALID_OPTIONS });
    });

    test("accepts zero role ping cooldown minutes as no cooldown", async () => {
        const result = await feature.lfgRolePingCooldown(GUILD_ID, "set", 0);

        expect(result).toEqual({
            kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_SET,
            value: { minutes: 0 },
        });
        expect((await getStoredConfig())?.lfgRolePingCooldownMinutes).toBe(0);
    });

    test("adds role", async () => {
        const result = await feature.lfgRole(GUILD_ID, "add", ROLE_ID);

        expect(result).toEqual({
            kind: EAdminFeatureReturnKind.LFG_ROLE_ADDED,
            value: { role: ROLE_ID },
        });
        expect((await getStoredRoles()).map((role) => role.role)).toEqual([ROLE_ID]);
    });

    test("rejects adding everyone role", async () => {
        const result = await feature.lfgRole(GUILD_ID, "add", GUILD_ID);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_CANNOT_BE_EVERYONE });
        expect(await getStoredRoles()).toEqual([]);
    });

    test("removes role", async () => {
        await feature.lfgRole(GUILD_ID, "add", ROLE_ID);

        const result = await feature.lfgRole(GUILD_ID, "remove", ROLE_ID);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_REMOVED, value: { role: ROLE_ID } });
        expect(await getStoredRoles()).toEqual([]);
    });

    test("role command without options explains the setting and shows current value", async () => {
        const result = await feature.lfgRole(GUILD_ID, null, null);

        expect(result).toEqual({
            kind: EAdminFeatureReturnKind.LFG_ROLE_HELP,
            value: { roles: [] },
        });
    });

    test("rejects add without role", async () => {
        const result = await feature.lfgRole(GUILD_ID, "add", null);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE });
    });

    test("rejects remove without role", async () => {
        const result = await feature.lfgRole(GUILD_ID, "remove", null);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE });
    });

    test("rejects duplicate role", async () => {
        await feature.lfgRole(GUILD_ID, "add", ROLE_ID);

        const result = await feature.lfgRole(GUILD_ID, "add", ROLE_ID);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_ALREADY_EXISTS, value: { role: ROLE_ID } });
    });

    test("rejects removing role that was not added", async () => {
        const result = await feature.lfgRole(GUILD_ID, "remove", ROLE_ID);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_NOT_FOUND, value: { role: ROLE_ID } });
    });

    test("rejects adding more than five roles", async () => {
        for (let i = 0; i < ADMIN_LFG_ROLE_LIMIT; i++) {
            await feature.lfgRole(GUILD_ID, "add", `role-${i}`);
        }

        const result = await feature.lfgRole(GUILD_ID, "add", "role-extra");

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_LIMIT_REACHED });
        expect(await getStoredRoles()).toHaveLength(ADMIN_LFG_ROLE_LIMIT);
    });

    test("rejects role without add or remove action", async () => {
        const result = await feature.lfgRole(GUILD_ID, null, ROLE_ID);

        expect(result).toEqual({ kind: EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS });
    });
});
