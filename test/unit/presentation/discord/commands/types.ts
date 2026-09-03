import { ApplicationCommandOptionType } from "discord.js";
import type { ICommandRegistrationData } from "../../../../../src/presentation/discord/commands/types.ts";

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
