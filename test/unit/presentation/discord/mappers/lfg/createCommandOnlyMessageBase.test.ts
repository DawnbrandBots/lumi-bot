import { describe, expect, test } from "vitest";
import {
    createInvalidLfgSubcommandMessageBase,
    createLfgHelpMessageBase,
} from "../../../../../../src/presentation/discord/mappers/lfg.ts";

describe("LFG command-only messages", () => {
    test("creates help message", () => {
        expect(createLfgHelpMessageBase()).toMatchSnapshot();
    });

    test("creates invalid subcommand message", () => {
        expect(createInvalidLfgSubcommandMessageBase()).toMatchSnapshot();
    });
});
