import { Events } from "discord.js";
import getBot from "../../../loaders/bot.ts";
import type { TDiscordEventHandlers } from "./eventHandlers.ts";

export function composeDiscordBot(arg: { readonly eventHandlers: TDiscordEventHandlers }) {
    const bot = getBot();

    bot.on(Events.ClientReady, arg.eventHandlers.clientReady);
    bot.on(Events.MessageCreate, arg.eventHandlers.messageCreate);
    bot.on(Events.InteractionCreate, arg.eventHandlers.interactionCreate);

    return bot;
}
