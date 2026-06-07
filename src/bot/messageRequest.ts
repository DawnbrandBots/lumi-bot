import { userMention, type Message } from "discord.js";
import { EBotRequestKind, type TBotRequest } from "./request.ts";

export function mapMentionMessageToBotRequest(message: Message): TBotRequest | null {
    if (message.author.bot) {
        return null;
    }
    if (!message.mentions.parsedUsers.has(message.client.user.id)) {
        return null;
    }

    const botMention = userMention(message.client.user.id);
    if (message.content === botMention) {
        return { kind: EBotRequestKind.HELP };
    }

    const mentionPrefix = `${botMention} `;
    if (!message.content.startsWith(mentionPrefix)) {
        return null;
    }
    return { kind: EBotRequestKind.SEARCH, input: message.content.slice(mentionPrefix.length) };
}
