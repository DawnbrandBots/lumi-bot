import type { CacheType, ChatInputCommandInteraction, CommandInteraction } from "discord.js";

export type TCommandInteraction = ChatInputCommandInteraction<CacheType>;
export type THandleCommandInteraction = (interaction: CommandInteraction<CacheType>) => Promise<void>;
