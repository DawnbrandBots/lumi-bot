import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../../../src/application/admin/types.ts";
import mapAdminResultToMessage, {
    mapAdminInvalidOptionsToMessage,
    mapAdminMissingValueToMessage,
} from "../../../../../../src/presentation/discord/mappers/admin.ts";
import { EMessageKind } from "../../../../../../src/presentation/discord/message.types.ts";
import { assertMessage } from "./fixtures.ts";

describe("admin option error messages", () => {
    test("maps invalid option combinations and missing values", () => {
        const missingChannel = mapAdminMissingValueToMessage("Missing channel");
        const invalidOptions = mapAdminInvalidOptionsToMessage();
        const missingRole = mapAdminMissingValueToMessage("Missing role");
        const invalidRoleOptions = mapAdminInvalidOptionsToMessage();
        const everyoneRole = assertMessage(
            mapAdminResultToMessage({
                kind: EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE,
            }),
        );

        expect(missingChannel.kind).toBe(EMessageKind.ERROR);
        expect(missingChannel.embeds?.[0]).toMatchObject({ description: "Missing channel" });
        expect(invalidOptions.kind).toBe(EMessageKind.ERROR);
        expect(invalidOptions.embeds?.[0]).toMatchObject({ description: "Invalid options" });
        expect(missingRole.kind).toBe(EMessageKind.ERROR);
        expect(missingRole.embeds?.[0]).toMatchObject({ description: "Missing role" });
        expect(invalidRoleOptions.kind).toBe(EMessageKind.ERROR);
        expect(invalidRoleOptions.embeds?.[0]).toMatchObject({ description: "Invalid options" });
        expect(everyoneRole.kind).toBe(EMessageKind.ERROR);
        expect(everyoneRole.embeds?.[0]).toMatchObject({
            description: "`@everyone` cannot be configured as an LFG pingable role.",
        });
    });
});
