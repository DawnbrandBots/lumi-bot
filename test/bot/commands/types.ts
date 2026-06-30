import { ApplicationCommandOptionType } from "discord.js";
import type {
    TCommandAutocompleteHandler,
    TCommandData,
    TCommandHandlers,
    TCommandRunHandler,
} from "../../../src/bot/commands/types.ts";

declare const run: TCommandRunHandler;
declare const autocomplete: TCommandAutocompleteHandler;

export const rootCommandData = {
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
} as const satisfies TCommandData;

export const rootCommandHandlers = {
    run,
    autocomplete: {
        query: autocomplete,
    },
} satisfies TCommandHandlers<typeof rootCommandData>;

export const nestedCommandData = {
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
} as const satisfies TCommandData;

export const nestedCommandHandlers = {
    run: {
        list: run,
        find: run,
        admin: {
            move: run,
            remove: run,
        },
    },
    autocomplete: {
        find: {
            query: autocomplete,
        },
        admin: {
            move: {
                destination: autocomplete,
            },
        },
    },
} satisfies TCommandHandlers<typeof nestedCommandData>;

const missingRunHandler = {
    run: {
        list: run,
        find: run,
        // @ts-expect-error -- Every subcommand in a group requires a run handler.
        admin: {
            move: run,
        },
    },
    autocomplete: nestedCommandHandlers.autocomplete,
} satisfies TCommandHandlers<typeof nestedCommandData>;
void missingRunHandler;

const missingAutocompleteHandler = {
    run: nestedCommandHandlers.run,
    // @ts-expect-error -- Every autocomplete option requires a handler at the same route.
    autocomplete: {
        find: {
            query: autocomplete,
        },
    },
} satisfies TCommandHandlers<typeof nestedCommandData>;
void missingAutocompleteHandler;

export const plainCommandData = {
    name: "plain",
    description: "Has no autocomplete options.",
} as const satisfies TCommandData;

const unexpectedAutocompleteHandler = {
    run,
    // @ts-expect-error -- Commands without autocomplete options must not advertise a handler map.
    autocomplete: {
        query: autocomplete,
    },
} satisfies TCommandHandlers<typeof plainCommandData>;
void unexpectedAutocompleteHandler;
