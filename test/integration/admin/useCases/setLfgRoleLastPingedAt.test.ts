import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { GUILD_ID, ROLE_ID, useAdminUseCases } from "./shared.ts";

describe("setLfgRoleLastPingedAt", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("sets role last ping date", async () => {
        await admin.useCases.addLfgRole(GUILD_ID, ROLE_ID);

        await admin.useCases.setLfgRoleLastPingedAt(GUILD_ID, ROLE_ID, new Date("2026-06-16T10:00:00.000Z"));

        await expect(admin.useCases.getLfgRoleConfig(GUILD_ID, ROLE_ID)).resolves.toEqual({
            kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
            value: { role: ROLE_ID, lastPingedAt: "2026-06-16T10:00:00.000Z" },
        });
    });
});
