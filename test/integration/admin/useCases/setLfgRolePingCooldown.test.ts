import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { GUILD_ARG, LFG_ROLE_PING_COOLDOWN_ARG, useAdminUseCases } from "./shared.ts";

describe("setLfgRolePingCooldown", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("sets role ping cooldown", async () => {
        const result = await admin.useCases.setLfgRolePingCooldown(LFG_ROLE_PING_COOLDOWN_ARG);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET,
            value: { minutes: 45 },
        });
        expect((await admin.getStoredConfig())?.lfgRolePingCooldownMinutes).toBe(45);
    });

    test("accepts zero role ping cooldown minutes as no cooldown", async () => {
        const result = await admin.useCases.setLfgRolePingCooldown({ ...GUILD_ARG, minutes: 0 });

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET,
            value: { minutes: 0 },
        });
        expect((await admin.getStoredConfig())?.lfgRolePingCooldownMinutes).toBe(0);
    });
});
