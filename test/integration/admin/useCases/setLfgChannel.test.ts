import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../src/application/admin/types.ts";
import { CHANNEL_ID, LFG_CHANNEL_ARG, useAdminUseCases } from "./shared.ts";

describe("setLfgChannel", () => {
    const admin = useAdminUseCases();

    test("sets channel", async () => {
        const result = await admin.useCases.setLfgChannel(LFG_CHANNEL_ARG);

        expect(result).toEqual({
            kind: EAdminResultKind.LFG_CHANNEL_SET,
            value: { channel: CHANNEL_ID },
        });
        expect((await admin.getStoredConfig())?.lfgChannel).toBe(CHANNEL_ID);
    });
});
