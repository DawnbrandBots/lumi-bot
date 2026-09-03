import { ApplicationCommandOptionType } from "discord.js";
import { SHOW_RESPONSE_OPTION_NAME } from "../commands/constants.ts";

export const SHOW_RESPONSE_OPTION = {
    type: ApplicationCommandOptionType.Boolean,
    name: SHOW_RESPONSE_OPTION_NAME,
    description: "Show response to everyone. false by default.",
} as const;
