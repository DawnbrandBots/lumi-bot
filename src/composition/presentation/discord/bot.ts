import { Events } from "discord.js";
import { createDiscordClient } from "../../../presentation/discord/client.ts";
import type { TDiscordEventHandlers } from "./eventHandlers.ts";

export function composeDiscordBot(arg: { readonly eventHandlers: TDiscordEventHandlers }) {
    const bot = createDiscordClient();

    bot.on(Events.ClientReady, arg.eventHandlers.clientReady);
    bot.on(Events.MessageCreate, arg.eventHandlers.messageCreate);
    bot.on(Events.InteractionCreate, arg.eventHandlers.interactionCreate);

    return bot;
}
