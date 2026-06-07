import { userMention, type Message } from "discord.js";
import { EBotFeatureRequestKind, type TBotRequest } from "./featureRequest.ts";

export function mapMentionMessageToFeatureRequest(message: Message): TBotRequest | null {
    if (message.author.bot) {
        return null;
    }
    if (!message.mentions.parsedUsers.has(message.client.user.id)) {
        return null;
    }

    const botMention = userMention(message.client.user.id);
    if (message.content === botMention) {
        return { kind: EBotFeatureRequestKind.HELP };
    }

    const mentionPrefix = `${botMention} `;
    if (!message.content.startsWith(mentionPrefix)) {
        return null;
    }
    return { kind: EBotFeatureRequestKind.SEARCH, input: message.content.slice(mentionPrefix.length) };
}
