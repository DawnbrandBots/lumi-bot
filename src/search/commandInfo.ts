import { ApplicationCommandOptionType } from "discord.js";
import type { TCommandData, TCommandInfo } from "../bot/commands/types.ts";
import {
    DISCORD_BOT_NAME,
    DISCORD_COMMAND_DEFAULTS,
    SEARCH_MAX_INPUT_LENGTH,
    SEARCH_TERMS_OPTION_NAME,
} from "../bot/constants.ts";

export const searchCommandData = {
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
} as const satisfies TCommandData;

export const searchCommandInfo = {
    data: searchCommandData,
    pingEquivalent: `@${DISCORD_BOT_NAME} <SEARCH_TERMS>`,
} as const satisfies TCommandInfo<typeof searchCommandData>;
