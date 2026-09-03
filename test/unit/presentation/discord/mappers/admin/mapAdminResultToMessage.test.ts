import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../../../src/application/admin/types.ts";
import mapAdminResultToMessage from "../../../../../../src/presentation/discord/mappers/admin.ts";
import { CHANNEL_ID, ROLE_ID } from "./fixtures.ts";

describe(mapAdminResultToMessage.name, () => {
    test.each([
        [
            EAdminResultKind.LFG_CHANNEL_SET,
            {
                kind: EAdminResultKind.LFG_CHANNEL_SET,
                value: { channel: CHANNEL_ID },
            },
        ],
        [
            EAdminResultKind.LFG_CHANNEL_CLEARED,
            {
                kind: EAdminResultKind.LFG_CHANNEL_CLEARED,
            },
        ],
        [
            EAdminResultKind.LFG_GET_CONFIG,
            {
                kind: EAdminResultKind.LFG_GET_CONFIG,
                value: {
                    lfgChannel: CHANNEL_ID,
                    lfgRolePingCooldownMinutes: 45,
                    lfgRoles: [{ role: ROLE_ID, lastPingedAt: null }],
                },
            },
        ],
        [
            EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET,
            {
                kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET,
                value: { minutes: 45 },
            },
        ],
        [
            EAdminResultKind.LFG_ROLE_ADDED,
            {
                kind: EAdminResultKind.LFG_ROLE_ADDED,
                value: { role: ROLE_ID },
            },
        ],
        [
            EAdminResultKind.LFG_ROLE_REMOVED,
            {
                kind: EAdminResultKind.LFG_ROLE_REMOVED,
                value: { role: ROLE_ID },
            },
        ],
    ] as const)("%s", (_, result) => {
        expect(mapAdminResultToMessage(result)).toMatchSnapshot();
    });
});
