import debug from "debug";
import type { Message } from "discord.js";
import { mapMentionMessageToBotRequest } from "../../bot/messageRequest.ts";
import type { TBotRequest } from "../../bot/request.ts";
import { addDefaultFollowUps, sendResponse } from "../../bot/response.ts";
import type { IInteractionHandlerReturnType } from "../../bot/types.ts";

const log = debug("bot");

export default function getMessageCreateEventHandler({
    handleBotRequest,
}: {
    handleBotRequest: (request: TBotRequest) => Promise<IInteractionHandlerReturnType>;
}) {
    return async function handleMessageCreate(message: Message) {
        log(message);

        const request = mapMentionMessageToBotRequest(message);
        if (!request) {
            return;
        }

        const baseResponse = await handleBotRequest(request);
        await sendResponse({
            response: addDefaultFollowUps(baseResponse),
            reply: (reply) => message.reply(reply),
            followUp: (followUp) => message.reply(followUp),
        });
    };
}
