import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { LFG_CHANNEL_ARG, GUILD_ARG, useAdminUseCases } from "./shared.ts";

describe("clearLfgChannel", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("clears channel", async () => {
        await admin.useCases.setLfgChannel(LFG_CHANNEL_ARG);

        const result = await admin.useCases.clearLfgChannel(GUILD_ARG);

        expect(result).toEqual({ kind: EAdminResultKind.LFG_CHANNEL_CLEARED });
        expect((await admin.getStoredConfig())?.lfgChannel).toBeNull();
    });
});
