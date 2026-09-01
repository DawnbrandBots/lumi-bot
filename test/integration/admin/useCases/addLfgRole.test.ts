import { describe, expect, test } from "vitest";
import { ADMIN_LFG_ROLE_LIMIT } from "../../../../src/application/admin/constants.ts";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { GUILD_ARG, GUILD_ID, LFG_ROLE_ARG, ROLE_ID, useAdminUseCases } from "./shared.ts";

describe("addLfgRole", () => {
    const admin = useAdminUseCases();

    test("adds role", async () => {
        const result = await admin.useCases.addLfgRole(LFG_ROLE_ARG);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_ROLE_ADDED,
            value: { role: ROLE_ID },
        });
        expect((await admin.getStoredRoles()).map((role) => role.role)).toEqual([ROLE_ID]);
    });

    test("rejects adding everyone role", async () => {
        const result = await admin.useCases.addLfgRole({ ...GUILD_ARG, roleId: GUILD_ID });

        expect(result).toEqual({ kind: EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE });
        expect(await admin.getStoredRoles()).toEqual([]);
    });

    test("rejects duplicate role", async () => {
        await admin.useCases.addLfgRole(LFG_ROLE_ARG);

        const result = await admin.useCases.addLfgRole(LFG_ROLE_ARG);

        expect(result).toEqual({ kind: EAdminResultKind.LFG_ROLE_ALREADY_EXISTS, value: { role: ROLE_ID } });
    });

    test("rejects adding more than five roles", async () => {
        for (let i = 0; i < ADMIN_LFG_ROLE_LIMIT; i++) {
            await admin.useCases.addLfgRole({ ...GUILD_ARG, roleId: `role-${i}` });
        }

        const result = await admin.useCases.addLfgRole({ ...GUILD_ARG, roleId: "role-extra" });

        expect(result).toEqual({ kind: EAdminResultKind.LFG_ROLE_LIMIT_REACHED });
        expect(await admin.getStoredRoles()).toHaveLength(ADMIN_LFG_ROLE_LIMIT);
    });
});
