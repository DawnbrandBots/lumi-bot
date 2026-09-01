import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { GUILD_ARG, LFG_ROLE_PING_COOLDOWN_ARG, useAdminUseCases } from "./shared.ts";

describe("clearLfgRolePingCooldown", () => {
    const admin = useAdminUseCases();

    test("clears role ping cooldown", async () => {
        await admin.useCases.setLfgRolePingCooldown(LFG_ROLE_PING_COOLDOWN_ARG);

        const result = await admin.useCases.clearLfgRolePingCooldown(GUILD_ARG);

        expect(result).toEqual({ kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED });
        expect((await admin.getStoredConfig())?.lfgRolePingCooldownMinutes).toBeNull();
    });
});
