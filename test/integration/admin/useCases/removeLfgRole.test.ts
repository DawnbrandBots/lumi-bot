import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { LFG_ROLE_ARG, ROLE_ID, useAdminUseCases } from "./shared.ts";

describe("removeLfgRole", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("removes role", async () => {
        await admin.useCases.addLfgRole(LFG_ROLE_ARG);

        const result = await admin.useCases.removeLfgRole(LFG_ROLE_ARG);

        expect(result).toEqual({ kind: EAdminResultKind.LFG_ROLE_REMOVED, value: { role: ROLE_ID } });
        expect(await admin.getStoredRoles()).toEqual([]);
    });

    test("rejects removing role that was not added", async () => {
        const result = await admin.useCases.removeLfgRole(LFG_ROLE_ARG);

        expect(result).toEqual({ kind: EAdminResultKind.LFG_ROLE_NOT_FOUND, value: { role: ROLE_ID } });
    });
});
