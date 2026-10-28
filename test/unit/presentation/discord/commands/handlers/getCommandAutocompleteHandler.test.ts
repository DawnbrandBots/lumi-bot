import { describe, expect, test } from "vitest";
import getAutocompleteHandler from "../../../../../../src/composition/presentation/getAutocompleteHandler.ts";
import { AUTOCOMPLETE } from "../../../../../../src/composition/presentation/autocomplete.ts";
import { autocompleteListableItem } from "../../../../../../src/presentation/discord/services/bazaar/autocompleteListableItem.ts";
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

    test.each([
        { commandName: "bazaar", focusedOption: "item", subcommand: "sale", subcommandGroup: "upsert" },
        { commandName: "bazaar", focusedOption: "item", subcommand: "purchase", subcommandGroup: "list" },
        { commandName: "bazaar-manage", focusedOption: "item", subcommand: "sale", subcommandGroup: "delete" },
    ] as const)("routes production Bazaar autocomplete for $commandName $subcommandGroup $subcommand", (options) => {
        expect(getAutocompleteHandler(AUTOCOMPLETE)(getMockAutocompleteInteraction(options))).toBe(
            autocompleteListableItem,
        );
    });
});
