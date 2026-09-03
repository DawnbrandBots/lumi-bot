import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import {
    CHANNEL_ID,
    GUILD_ARG,
    LFG_CHANNEL_ARG,
    LFG_ROLE_ARG,
    LFG_ROLE_LAST_PINGED_AT_ARG,
    ROLE_ID,
    useAdminUseCases,
} from "./shared.ts";

describe("getGuildConfig", () => {
    const admin = useAdminUseCases();

    test("returns null when config is missing", async () => {
        const result = await admin.useCases.getGuildConfig(GUILD_ARG);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_GET_CONFIG,
            value: null,
        });
        expect(await admin.getStoredConfig()).toBeNull();
    });

    test("returns existing config on read", async () => {
        await admin.useCases.setLfgChannel(LFG_CHANNEL_ARG);
        await admin.useCases.addLfgRole(LFG_ROLE_ARG);
        await admin.useCases.setLfgRoleLastPingedAt(LFG_ROLE_LAST_PINGED_AT_ARG);

        const result = await admin.useCases.getGuildConfig(GUILD_ARG);

        expect(result.kind).toBe(EAdminResultKind.LFG_GET_CONFIG);
        expect(result.value?.lfgChannel).toBe(CHANNEL_ID);
        expect(result.value?.lfgRoles).toEqual([{ role: ROLE_ID, lastPingedAt: "2026-06-16T10:00:00.000Z" }]);
    });
});
