import { describe, expect, test } from "vitest";
import {
    createInvalidLfgSubcommandMessageBase,
    createLfgHelpMessageBase,
} from "../../../../../../src/presentation/discord/mappers/lfg.ts";
import { EMessageKind } from "../../../../../../src/presentation/discord/message.types.ts";

describe("LFG command-only messages", () => {
    test("creates help message", () => {
        expect(createLfgHelpMessageBase()).toMatchObject({
            kind: EMessageKind.NEUTRAL,
            embeds: [{ description: expect.any(String) }],
        });
    });

    test("creates invalid subcommand message", () => {
        expect(createInvalidLfgSubcommandMessageBase()).toMatchObject({
            kind: EMessageKind.ERROR,
            embeds: [{ description: "Please specify a valid subcommand." }],
        });
    });
});
