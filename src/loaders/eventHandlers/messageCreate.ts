import debug from "debug";
import type { Message } from "discord.js";
import type { TBotRequest } from "../../bot/featureRequest.ts";
import { mapMentionMessageToFeatureRequest } from "../../bot/messageRequest.ts";
import { addDefaultFollowUps, sendMessageResponse } from "../../bot/response.ts";
import type { IInteractionHandlerReturnType } from "../../bot/types.ts";

const log = debug("bot");

export default function getMessageCreateEventHandler({
    handleBotFeatureRequest,
}: {
    handleBotFeatureRequest: (request: TBotRequest) => Promise<IInteractionHandlerReturnType>;
}) {
    return async function handleMessageCreate(message: Message) {
        log(message);

        const request = mapMentionMessageToFeatureRequest(message);
        if (!request) {
            return;
        }
        const baseResponse = await handleBotFeatureRequest(request);
        await sendMessageResponse(message, addDefaultFollowUps(baseResponse));
    };
}
