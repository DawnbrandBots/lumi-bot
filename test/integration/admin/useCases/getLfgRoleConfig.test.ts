import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { GUILD_ID, ROLE_ID, useAdminUseCases } from "./shared.ts";

describe("getLfgRoleConfig", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("returns null when role config is missing", async () => {
        const result = await admin.useCases.getLfgRoleConfig(GUILD_ID, ROLE_ID);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
            value: null,
        });
    });

    test("returns existing role config", async () => {
        await admin.useCases.addLfgRole(GUILD_ID, ROLE_ID);
        await admin.useCases.setLfgRoleLastPingedAt(GUILD_ID, ROLE_ID, new Date("2026-06-16T10:00:00.000Z"));

        const result = await admin.useCases.getLfgRoleConfig(GUILD_ID, ROLE_ID);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
            value: { role: ROLE_ID, lastPingedAt: "2026-06-16T10:00:00.000Z" },
        });
    });
});
