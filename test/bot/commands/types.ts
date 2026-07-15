import { ApplicationCommandOptionType } from "discord.js";
import type {
    ICommandApiInfo,
    TCommandAutocompleteHandler,
    TCommandHandlers,
    TCommandRunHandler,
} from "../../../src/bot/commands/types.ts";

declare const run: TCommandRunHandler;
declare const autocomplete: TCommandAutocompleteHandler;

export const rootCommandApiInfo = {
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
} as const satisfies ICommandApiInfo;

export const rootCommandHandlers = {
    run,
    autocomplete: {
        query: autocomplete,
    },
} satisfies TCommandHandlers<typeof rootCommandApiInfo>;

export const nestedCommandApiInfo = {
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
} as const satisfies ICommandApiInfo;

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
} satisfies TCommandHandlers<typeof nestedCommandApiInfo>;

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
} satisfies TCommandHandlers<typeof nestedCommandApiInfo>;
void missingRunHandler;

const missingAutocompleteHandler = {
    run: nestedCommandHandlers.run,
    // @ts-expect-error -- Every autocomplete option requires a handler at the same route.
    autocomplete: {
        find: {
            query: autocomplete,
        },
    },
} satisfies TCommandHandlers<typeof nestedCommandApiInfo>;
void missingAutocompleteHandler;

export const plainCommandApiInfo = {
    name: "plain",
    description: "Has no autocomplete options.",
} as const satisfies ICommandApiInfo;

const unexpectedAutocompleteHandler = {
    run,
    // @ts-expect-error -- Commands without autocomplete options must not advertise a handler map.
    autocomplete: {
        query: autocomplete,
    },
} satisfies TCommandHandlers<typeof plainCommandApiInfo>;
void unexpectedAutocompleteHandler;
