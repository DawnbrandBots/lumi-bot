import { ApplicationCommandOptionType } from "discord.js";
import { SEARCH_MAX_INPUT_LENGTH } from "../../../application/search/constants.ts";
import { DISCORD_COMMAND_DEFAULTS } from "../commands/constants.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../commands/search/constants.ts";
import type { ICommandRegistrationData } from "../commands/types.ts";

export const searchCommandCommandRegistrationData = {
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
} as const satisfies ICommandRegistrationData;
