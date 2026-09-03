import { describe, expect, test } from "vitest";
import {
    mapAdminLfgChannelHelpToMessage,
    mapAdminLfgRoleHelpToMessage,
    mapAdminLfgRolePingCooldownHelpToMessage,
} from "../../../../../../src/presentation/discord/mappers/admin.ts";

describe("admin help messages", () => {
    test("maps LFG channel help", () => {
        expect(mapAdminLfgChannelHelpToMessage({ channel: null })).toMatchSnapshot();
    });

    test("maps LFG role ping cooldown help", () => {
        expect(mapAdminLfgRolePingCooldownHelpToMessage({ minutes: 45 })).toMatchSnapshot();
    });

    test("maps LFG role help", () => {
        expect(mapAdminLfgRoleHelpToMessage({ roles: [] })).toMatchSnapshot();
    });
});
