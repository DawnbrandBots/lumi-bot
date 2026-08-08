import debug from "debug";
import { userMention } from "discord.js";
import type { TResolveSearchInput } from "../../../application/search/resolveSearchInput.types.ts";
import helpFeature from "../../../help/feature.ts";
import mapHelpFeatureReturnToMessage from "../mappers/help.ts";
import mapSearchFeatureReturnToMessages from "../mappers/search.ts";
import type { TMessageCreateEventInteraction } from "./messageCreate.types.ts";

const log = debug(handleMessageCreate.name);

export async function handleMessageCreate(arg: {
    interaction: TMessageCreateEventInteraction;
    resolveSearchInput: TResolveSearchInput;
}) {
    log(arg.interaction);

    if (arg.interaction.author.bot) {
        return;
    }
    const mentionedUsers = arg.interaction.mentions.parsedUsers;
    if (!mentionedUsers.has(arg.interaction.client.user.id)) {
        return;
    }
    const botMention = userMention(arg.interaction.client.user.id);
    if (arg.interaction.content === botMention) {
        const message = mapHelpFeatureReturnToMessage(helpFeature());
        await arg.interaction.reply(message);
        return;
    }
    const startingBotMentionAndSpaceStr = botMention + " ";
    if (!arg.interaction.content.startsWith(startingBotMentionAndSpaceStr)) {
        return;
    }
    const input = arg.interaction.content.slice(startingBotMentionAndSpaceStr.length);
    const result = await arg.resolveSearchInput(input);
    const { reply, followUps } = mapSearchFeatureReturnToMessages(result);
    await arg.interaction.reply(reply);
    for (const followUp of followUps ?? []) {
        await arg.interaction.reply(followUp);
    }
}
