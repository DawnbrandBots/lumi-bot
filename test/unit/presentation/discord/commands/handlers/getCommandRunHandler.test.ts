import { describe, expect, test } from "vitest";
import getCommandRunHandler from "../../../../../../src/composition/presentation/getCommandRunHandler.ts";
import {
    BAZAAR_COMMANDS,
    BAZAAR_MANAGE_COMMANDS,
    COMMANDS,
} from "../../../../../../src/composition/presentation/commands.ts";
import { commandHandlers, findRun, getMockChatInputInteraction, moveRun, rootRun } from "./fixtures.ts";

describe(getCommandRunHandler.name, () => {
    test.each([
        ["root command", { commandName: "search" }, rootRun],
        ["direct subcommand", { commandName: "rooms", subcommand: "find" }, findRun],
        ["grouped subcommand", { commandName: "rooms", subcommand: "move", subcommandGroup: "admin" }, moveRun],
        ["unknown route", { commandName: "rooms", subcommand: "unknown" }, undefined],
    ] as const)("%s", (_name, interactionOptions, expected) => {
        const interaction = getMockChatInputInteraction(interactionOptions);

        expect(getCommandRunHandler(commandHandlers)(interaction)).toBe(expected);
    });

    test.each([
        [
            "Bazaar upsert",
            { commandName: "bazaar", subcommandGroup: "upsert", subcommand: "purchase" },
            BAZAAR_COMMANDS.upsert.purchase,
        ],
        [
            "Bazaar list",
            { commandName: "bazaar", subcommandGroup: "list", subcommand: "sale" },
            BAZAAR_COMMANDS.list.sale,
        ],
        [
            "managed Bazaar deletion",
            { commandName: "bazaar-manage", subcommandGroup: "delete", subcommand: "purchase" },
            BAZAAR_MANAGE_COMMANDS.delete.purchase,
        ],
    ] as const)("routes a production %s command", (_name, interactionOptions, expected) => {
        expect(getCommandRunHandler(COMMANDS)(getMockChatInputInteraction(interactionOptions))).toBe(expected);
    });
});
