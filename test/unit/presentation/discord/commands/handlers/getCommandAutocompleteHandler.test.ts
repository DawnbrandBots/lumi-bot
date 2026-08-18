import { describe, expect, test } from "vitest";
import { getCommandAutocompleteHandler } from "../../../../../../src/presentation/discord/commands/handlers.ts";
import {
    commandHandlers,
    findAutocomplete,
    getMockAutocompleteInteraction,
    moveAutocomplete,
    rootAutocomplete,
} from "./fixtures.ts";

describe(getCommandAutocompleteHandler.name, () => {
    test.each([
        ["root option", commandHandlers.search, { commandName: "search", focusedOption: "query" }, rootAutocomplete],
        [
            "direct subcommand option",
            commandHandlers.rooms,
            { commandName: "rooms", focusedOption: "query", subcommand: "find" },
            findAutocomplete,
        ],
        [
            "grouped subcommand option",
            commandHandlers.rooms,
            {
                commandName: "rooms",
                focusedOption: "destination",
                subcommand: "move",
                subcommandGroup: "admin",
            },
            moveAutocomplete,
        ],
        [
            "command without autocomplete",
            commandHandlers.plain,
            { commandName: "plain", focusedOption: "query" },
            undefined,
        ],
        [
            "unknown option",
            commandHandlers.rooms,
            { commandName: "rooms", focusedOption: "unknown", subcommand: "find" },
            undefined,
        ],
    ] as const)("%s", (_name, command, interactionOptions, expected) => {
        const interaction = getMockAutocompleteInteraction(interactionOptions);

        expect(getCommandAutocompleteHandler(command, interaction)).toBe(expected);
    });
});
