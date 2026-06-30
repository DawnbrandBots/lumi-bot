import type { AutocompleteInteraction, CacheType, ChatInputCommandInteraction } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { getCommandAutocompleteHandler, getCommandRunHandler } from "../../../src/bot/commands/handlers.ts";
import type {
    TCommandAutocompleteHandler,
    TCommandRegistry,
    TCommandRunHandler,
} from "../../../src/bot/commands/types.ts";
import type { nestedCommandData, plainCommandData, rootCommandData } from "./types.ts";

const rootRun = vi.fn<TCommandRunHandler>();
const listRun = vi.fn<TCommandRunHandler>();
const findRun = vi.fn<TCommandRunHandler>();
const moveRun = vi.fn<TCommandRunHandler>();
const removeRun = vi.fn<TCommandRunHandler>();
const plainRun = vi.fn<TCommandRunHandler>();
const rootAutocomplete = vi.fn<TCommandAutocompleteHandler>();
const findAutocomplete = vi.fn<TCommandAutocompleteHandler>();
const moveAutocomplete = vi.fn<TCommandAutocompleteHandler>();

type TAllCommandData = typeof rootCommandData | typeof nestedCommandData | typeof plainCommandData;

const commandHandlers = {
    search: {
        run: rootRun,
        autocomplete: {
            query: rootAutocomplete,
        },
    },
    rooms: {
        run: {
            list: listRun,
            find: findRun,
            admin: {
                move: moveRun,
                remove: removeRun,
            },
        },
        autocomplete: {
            find: {
                query: findAutocomplete,
            },
            admin: {
                move: {
                    destination: moveAutocomplete,
                },
            },
        },
    },
    plain: {
        run: plainRun,
    },
} satisfies TCommandRegistry<TAllCommandData>;

function getMockChatInputInteraction({
    commandName,
    subcommand = null,
    subcommandGroup = null,
}: {
    commandName: string;
    subcommand?: string | null;
    subcommandGroup?: string | null;
}) {
    return {
        commandName,
        options: {
            getSubcommand: () => subcommand,
            getSubcommandGroup: () => subcommandGroup,
        },
    } as unknown as ChatInputCommandInteraction<CacheType>;
}

function getMockAutocompleteInteraction({
    commandName,
    focusedOption,
    subcommand = null,
    subcommandGroup = null,
}: {
    commandName: string;
    focusedOption: string;
    subcommand?: string | null;
    subcommandGroup?: string | null;
}) {
    return {
        commandName,
        options: {
            getFocused: () => ({ name: focusedOption, value: "" }),
            getSubcommand: () => subcommand,
            getSubcommandGroup: () => subcommandGroup,
        },
    } as unknown as AutocompleteInteraction<CacheType>;
}

describe(getCommandRunHandler.name, () => {
    test.each([
        ["root command", commandHandlers.search, { commandName: "search" }, rootRun],
        ["direct subcommand", commandHandlers.rooms, { commandName: "rooms", subcommand: "find" }, findRun],
        [
            "grouped subcommand",
            commandHandlers.rooms,
            { commandName: "rooms", subcommand: "move", subcommandGroup: "admin" },
            moveRun,
        ],
        ["unknown route", commandHandlers.rooms, { commandName: "rooms", subcommand: "unknown" }, undefined],
    ] as const)("%s", (_name, command, interactionOptions, expected) => {
        const interaction = getMockChatInputInteraction(interactionOptions);

        expect(getCommandRunHandler(command, interaction)).toBe(expected);
    });
});

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
