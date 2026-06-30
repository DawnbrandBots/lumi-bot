import { ApplicationCommandOptionType } from "discord.js";
import { DISCORD_COMMAND_DEFAULTS } from "../../bot/commands/constants.ts";
import type { ICommandApiInfo } from "../../bot/commands/types.ts";
import { SEARCH_MAX_INPUT_LENGTH, SEARCH_TERMS_OPTION_NAME } from "../../bot/constants.ts";

export const searchCommandApiInfo = {
    ...DISCORD_COMMAND_DEFAULTS,
    name: "search",
    description: "Displays info about weapon, unique weapon skill, disciple or spell matching search terms the most.",
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: SEARCH_TERMS_OPTION_NAME,
            description: "Name to search for.",
            required: true,
            max_length: SEARCH_MAX_INPUT_LENGTH,
            autocomplete: true,
        },
    ],
} as const satisfies ICommandApiInfo;
