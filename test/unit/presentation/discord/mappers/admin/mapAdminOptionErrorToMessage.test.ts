import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../../../src/application/admin/types.ts";
import mapAdminResultToMessage, {
    mapAdminInvalidOptionsToMessage,
    mapAdminMissingValueToMessage,
} from "../../../../../../src/presentation/discord/mappers/admin.ts";

describe("admin option error messages", () => {
    test.each(["Missing channel", "Missing role"])("maps missing value: %s", (message) => {
        expect(mapAdminMissingValueToMessage(message)).toMatchSnapshot();
    });

    test("maps invalid options", () => {
        expect(mapAdminInvalidOptionsToMessage()).toMatchSnapshot();
    });

    test("maps invalid role options", () => {
        expect(mapAdminInvalidOptionsToMessage()).toMatchSnapshot();
    });

    test("maps everyone role error", () => {
        expect(
            mapAdminResultToMessage({
                kind: EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE,
            }),
        ).toMatchSnapshot();
    });
});
