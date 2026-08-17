import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { CHANNEL_ID, GUILD_ID, useAdminUseCases } from "./shared.ts";

describe("setLfgChannel", { concurrent: false }, () => {
    const admin = useAdminUseCases();

    test("sets channel", async () => {
        const result = await admin.useCases.setLfgChannel(GUILD_ID, CHANNEL_ID);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_CHANNEL_SET,
            value: { channel: CHANNEL_ID },
        });
        expect((await admin.getStoredConfig())?.lfgChannel).toBe(CHANNEL_ID);
    });
});
