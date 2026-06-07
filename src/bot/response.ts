import type { BaseMessageOptions } from "discord.js";
import type { MaybePromise } from "../utils/types.ts";
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

export interface ISendResponseArg {
    response: IInteractionHandlerReturnType;
    reply: (reply: IInteractionHandlerReturnType["reply"]) => MaybePromise<unknown>;
    followUp: (followUp: BaseMessageOptions) => MaybePromise<unknown>;
}

export async function sendResponse({ response, reply, followUp }: ISendResponseArg) {
    await reply(response.reply);
    for (const followUpResponse of response.followUps ?? []) {
        await followUp(followUpResponse);
    }
}
