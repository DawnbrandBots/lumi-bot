import { describe, expect, test } from "vitest";
import getAutocompleteHandler from "../../../../../../src/composition/presentation/getAutocompleteHandler.ts";
import {
    autocompleteHandlers,
    findAutocomplete,
    getMockAutocompleteInteraction,
    moveAutocomplete,
    rootAutocomplete,
} from "./fixtures.ts";

describe(getAutocompleteHandler.name, () => {
    test.each([
        ["root option", { commandName: "search", focusedOption: "query" }, rootAutocomplete],
        [
            "direct subcommand option",
            { commandName: "rooms", focusedOption: "query", subcommand: "find" },
            findAutocomplete,
        ],
        [
            "grouped subcommand option",
            {
                commandName: "rooms",
                focusedOption: "destination",
                subcommand: "move",
                subcommandGroup: "admin",
            },
            moveAutocomplete,
        ],
        ["command without autocomplete", { commandName: "plain", focusedOption: "query" }, undefined],
        ["unknown option", { commandName: "rooms", focusedOption: "unknown", subcommand: "find" }, undefined],
    ] as const)("%s", (_name, interactionOptions, expected) => {
        const interaction = getMockAutocompleteInteraction(interactionOptions);

        expect(getAutocompleteHandler(autocompleteHandlers)(interaction)).toBe(expected);
    });
});
