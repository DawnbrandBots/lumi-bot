import { MessageFlags } from "discord.js";
import { describe, expect, test } from "vitest";
import {
    mapAdminLfgChannelHelpToMessage,
    mapAdminLfgRoleHelpToMessage,
    mapAdminLfgRolePingCooldownHelpToMessage,
} from "../../../../../../src/presentation/discord/mappers/admin.ts";
import { EMessageKind } from "../../../../../../src/presentation/discord/message.types.ts";
import { description } from "./fixtures.ts";

describe("admin help messages", () => {
    test("maps LFG channel help", () => {
        const message = mapAdminLfgChannelHelpToMessage({ channel: null });

        expect(message.kind).toBe(EMessageKind.NEUTRAL);
        expect(message.flags).toEqual([MessageFlags.Ephemeral]);
        expect(description(message)).toContain("Valid combinations");
        expect(description(message)).toContain("No channel set");
    });

    test("maps LFG role ping cooldown help", () => {
        const message = mapAdminLfgRolePingCooldownHelpToMessage({ minutes: 45 });

        expect(message.kind).toBe(EMessageKind.NEUTRAL);
        expect(message.flags).toEqual([MessageFlags.Ephemeral]);
        expect(description(message)).toContain("Valid combinations");
        expect(description(message)).toContain("45 minutes");
    });

    test("maps LFG role help", () => {
        const message = mapAdminLfgRoleHelpToMessage({ roles: [] });

        expect(message.kind).toBe(EMessageKind.NEUTRAL);
        expect(message.flags).toEqual([MessageFlags.Ephemeral]);
        expect(description(message)).toContain("Valid combinations");
        expect(description(message)).toContain("No pingable role set");
    });
});
