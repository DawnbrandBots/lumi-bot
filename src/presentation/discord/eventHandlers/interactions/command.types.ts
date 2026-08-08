import type { CacheType, ChatInputCommandInteraction } from "discord.js";

export type TCommandInteraction = ChatInputCommandInteraction<CacheType>;
export type THandleCommandInteraction = (interaction: TCommandInteraction) => Promise<void>;
