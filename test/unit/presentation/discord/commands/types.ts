import { ApplicationCommandOptionType } from "discord.js";
import type {
    ICommandRegistrationData,
    TCommandAutocompleteHandler,
    TCommandAutocompleteRegistry,
    TCommandRunHandler,
    TCommandRunRegistry,
} from "../../../../../src/presentation/discord/commands/types.ts";

declare const run: TCommandRunHandler;
declare const autocomplete: TCommandAutocompleteHandler;

export const rootCommandCommandRegistrationData = {
    name: "search",
    description: "Searches for something.",
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "query",
            description: "What to search for.",
            required: true,
            autocomplete: true,
        },
    ],
} as const satisfies ICommandRegistrationData;

export const nestedCommandCommandRegistrationData = {
    name: "rooms",
    description: "Manages rooms.",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "list",
            description: "Lists rooms.",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "find",
            description: "Finds a room.",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "query",
                    description: "Room to find.",
                    autocomplete: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "admin",
            description: "Admin actions.",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "move",
                    description: "Moves a room.",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "destination",
                            description: "Destination room.",
                            autocomplete: true,
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "remove",
                    description: "Removes a room.",
                },
            ],
        },
    ],
} as const satisfies ICommandRegistrationData;

export const plainCommandCommandRegistrationData = {
    name: "plain",
    description: "Has no autocomplete options.",
} as const satisfies ICommandRegistrationData;

type TCommandRegistrationData =
    | typeof rootCommandCommandRegistrationData
    | typeof nestedCommandCommandRegistrationData
    | typeof plainCommandCommandRegistrationData;

const runRegistry = {
    search: run,
    rooms: {
        list: run,
        find: run,
        admin: {
            move: run,
            remove: run,
        },
    },
    plain: run,
} satisfies TCommandRunRegistry<TCommandRegistrationData>;
void runRegistry;

const autocompleteRegistry = {
    search: {
        query: autocomplete,
    },
    rooms: {
        find: {
            query: autocomplete,
        },
        admin: {
            move: {
                destination: autocomplete,
            },
        },
    },
    plain: {},
} satisfies TCommandAutocompleteRegistry<TCommandRegistrationData>;
void autocompleteRegistry;

const missingRunHandler = {
    search: run,
    rooms: {
        list: run,
        find: run,
        // @ts-expect-error -- Every subcommand in a group requires a run handler.
        admin: {
            move: run,
            // remove handler missing
        },
    },
    plain: run,
} satisfies TCommandRunRegistry<TCommandRegistrationData>;
void missingRunHandler;

const missingAutocompleteHandler = {
    search: autocompleteRegistry.search,
    // @ts-expect-error -- Every autocomplete option requires a handler at the same route.
    rooms: {
        find: {
            query: autocomplete,
        },
        // admin subcommand group missing
    },
    plain: {},
} satisfies TCommandAutocompleteRegistry<TCommandRegistrationData>;
void missingAutocompleteHandler;
