import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { LFG_ROLE_ARG, LFG_ROLE_LAST_PINGED_AT_ARG, ROLE_ID, useAdminUseCases } from "./shared.ts";

describe("getLfgRoleConfig", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("returns null when role config is missing", async () => {
        const result = await admin.useCases.getLfgRoleConfig(LFG_ROLE_ARG);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
            value: null,
        });
    });

    test("returns existing role config", async () => {
        await admin.useCases.addLfgRole(LFG_ROLE_ARG);
        await admin.useCases.setLfgRoleLastPingedAt(LFG_ROLE_LAST_PINGED_AT_ARG);

        const result = await admin.useCases.getLfgRoleConfig(LFG_ROLE_ARG);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
            value: { role: ROLE_ID, lastPingedAt: "2026-06-16T10:00:00.000Z" },
        });
    });
});
