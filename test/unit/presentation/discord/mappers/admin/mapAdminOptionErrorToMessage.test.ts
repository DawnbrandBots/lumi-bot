import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../../../src/application/admin/types.ts";
import mapAdminResultToMessage, {
    mapAdminInvalidOptionsToMessage,
    mapAdminMissingValueToMessage,
} from "../../../../../../src/presentation/discord/mappers/admin.ts";
import { assertMessage } from "./fixtures.ts";

describe("admin option error messages", () => {
    test("maps invalid option combinations and missing values", () => {
        expect({
            missingChannel: mapAdminMissingValueToMessage("Missing channel"),
            invalidOptions: mapAdminInvalidOptionsToMessage(),
            missingRole: mapAdminMissingValueToMessage("Missing role"),
            invalidRoleOptions: mapAdminInvalidOptionsToMessage(),
            everyoneRole: assertMessage(
                mapAdminResultToMessage({
                    kind: EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE,
                }),
            ),
        }).toMatchSnapshot();
    });
});
