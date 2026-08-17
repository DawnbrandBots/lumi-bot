import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { GUILD_ID, useAdminUseCases } from "./shared.ts";

describe("clearLfgRolePingCooldown", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("clears role ping cooldown", async () => {
        await admin.useCases.setLfgRolePingCooldown(GUILD_ID, 45);

        const result = await admin.useCases.clearLfgRolePingCooldown(GUILD_ID);

        expect(result).toEqual({ kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED });
        expect((await admin.getStoredConfig())?.lfgRolePingCooldownMinutes).toBeNull();
    });
});
