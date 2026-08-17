import { describe, expect, test } from "vitest";
import { ADMIN_LFG_ROLE_LIMIT } from "../../../../src/application/admin/constants.ts";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { GUILD_ID, ROLE_ID, useAdminUseCases } from "./shared.ts";

describe("addLfgRole", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("adds role", async () => {
        const result = await admin.useCases.addLfgRole(GUILD_ID, ROLE_ID);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_ROLE_ADDED,
            value: { role: ROLE_ID },
        });
        expect((await admin.getStoredRoles()).map((role) => role.role)).toEqual([ROLE_ID]);
    });

    test("rejects adding everyone role", async () => {
        const result = await admin.useCases.addLfgRole(GUILD_ID, GUILD_ID);

        expect(result).toEqual({ kind: EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE });
        expect(await admin.getStoredRoles()).toEqual([]);
    });

    test("rejects duplicate role", async () => {
        await admin.useCases.addLfgRole(GUILD_ID, ROLE_ID);

        const result = await admin.useCases.addLfgRole(GUILD_ID, ROLE_ID);

        expect(result).toEqual({ kind: EAdminResultKind.LFG_ROLE_ALREADY_EXISTS, value: { role: ROLE_ID } });
    });

    test("rejects adding more than five roles", async () => {
        for (let i = 0; i < ADMIN_LFG_ROLE_LIMIT; i++) {
            await admin.useCases.addLfgRole(GUILD_ID, `role-${i}`);
        }

        const result = await admin.useCases.addLfgRole(GUILD_ID, "role-extra");

        expect(result).toEqual({ kind: EAdminResultKind.LFG_ROLE_LIMIT_REACHED });
        expect(await admin.getStoredRoles()).toHaveLength(ADMIN_LFG_ROLE_LIMIT);
    });
});
