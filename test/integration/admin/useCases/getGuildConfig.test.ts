import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { CHANNEL_ID, GUILD_ID, ROLE_ID, useAdminUseCases } from "./shared.ts";

describe("getGuildConfig", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("returns null when config is missing", async () => {
        const result = await admin.useCases.getGuildConfig(GUILD_ID);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_GET_CONFIG,
            value: null,
        });
        expect(await admin.getStoredConfig()).toBeNull();
    });

    test("returns existing config on read", async () => {
        await admin.useCases.setLfgChannel(GUILD_ID, CHANNEL_ID);
        await admin.useCases.addLfgRole(GUILD_ID, ROLE_ID);
        await admin.useCases.setLfgRoleLastPingedAt(GUILD_ID, ROLE_ID, new Date("2026-06-16T10:00:00.000Z"));

        const result = await admin.useCases.getGuildConfig(GUILD_ID);

        expect(result.kind).toBe(EAdminResultKind.LFG_GET_CONFIG);
        expect(result.value?.lfgChannel).toBe(CHANNEL_ID);
        expect(result.value?.lfgRoles).toEqual([{ role: ROLE_ID, lastPingedAt: "2026-06-16T10:00:00.000Z" }]);
    });
});
