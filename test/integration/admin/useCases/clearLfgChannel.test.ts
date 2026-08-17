import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { CHANNEL_ID, GUILD_ID, useAdminUseCases } from "./shared.ts";

describe("clearLfgChannel", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("clears channel", async () => {
        await admin.useCases.setLfgChannel(GUILD_ID, CHANNEL_ID);

        const result = await admin.useCases.clearLfgChannel(GUILD_ID);

        expect(result).toEqual({ kind: EAdminResultKind.LFG_CHANNEL_CLEARED });
        expect((await admin.getStoredConfig())?.lfgChannel).toBeNull();
    });
});
