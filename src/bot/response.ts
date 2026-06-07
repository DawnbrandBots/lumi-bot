import type { BaseMessageOptions, ChatInputCommandInteraction, Message } from "discord.js";
import { FOLLOW_UP_ERROR_MESSAGE_CONTENT } from "./constants.ts";
import { EMessageKind, type IInteractionHandlerReturnType } from "./types.ts";

export function addDefaultFollowUps(response: IInteractionHandlerReturnType): IInteractionHandlerReturnType {
    if (response.reply.kind !== EMessageKind.ERROR) {
        return response;
    }
    return {
        reply: response.reply,
        followUps: [
            ...(response.followUps ?? []),
            {
                content: FOLLOW_UP_ERROR_MESSAGE_CONTENT,
            },
        ],
    };
}

function getFollowUps(response: IInteractionHandlerReturnType): BaseMessageOptions[] {
    return response.followUps ?? [];
}

export async function sendMessageResponse(message: Message, response: IInteractionHandlerReturnType) {
    await message.reply(response.reply);
    if (!message.channel.isSendable()) {
        return;
    }
    for (const followUp of getFollowUps(response)) {
        await message.channel.send(followUp);
    }
}

export async function sendInteractionResponse(
    interaction: ChatInputCommandInteraction,
    response: IInteractionHandlerReturnType,
) {
    await interaction.reply(response.reply);
    for (const followUp of getFollowUps(response)) {
        await interaction.followUp(followUp);
    }
}
