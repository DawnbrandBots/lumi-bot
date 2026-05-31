import { type BaseMessageOptions } from "discord.js";
import {
    DISCORD_MESSAGE_ERROR_COLOR,
    DISCORD_MESSAGE_NEGATIVE_COLOR,
    DISCORD_MESSAGE_NEUTRAL_COLOR,
    DISCORD_MESSAGE_POSITIVE_COLOR,
    DISCORD_SAI_LAUGH_EMOJI_CALL,
    NOTABOT_DISCORD_MENTION,
} from "./constants.ts";
import type { IBaseMessageArg, IChildMessageArg } from "./types.ts";
import { EMessageKind } from "./types.ts";

/**
 * Formats a single message sent to Discord. All content should reside within a single embed.
 */
function createMessage<MessageOptions extends BaseMessageOptions = BaseMessageOptions>({
    kind,
    embed,
    ...messageOptions
}: IBaseMessageArg<MessageOptions>) {
    return { kind, embeds: [embed], ...messageOptions };
}

/**
 * Returns a function that creates Discord message data.
 */
const getMessageCreator =
    <ConstMessageOptions extends BaseMessageOptions = BaseMessageOptions>(
        /**
         * Default values applied to all messages created by the returned function.
         */
        cons: IBaseMessageArg<ConstMessageOptions>,
    ) =>
    <MessageOptions extends ConstMessageOptions = ConstMessageOptions>(arg: IChildMessageArg<MessageOptions>) =>
        createMessage<MessageOptions>({
            ...cons,
            ...arg,
            embed: { ...cons.embed, ...arg.embed },
        });

/**
 * Use to signify successful execution. (eg. search result found)
 */
export const createPositiveMessage = getMessageCreator({
    embed: { color: DISCORD_MESSAGE_POSITIVE_COLOR },
    kind: EMessageKind.POSITIVE,
});

/**
 * Use to send informative messages, that do not necessarily update the app's state. (eg. /help)
 */
export const createNeutralMessage = getMessageCreator({
    embed: { color: DISCORD_MESSAGE_NEUTRAL_COLOR },
    kind: EMessageKind.NEUTRAL,
});

/**
 * Use to signify that something wrong but not unexpected occured. (eg. bad input, search result not found for given input)
 */
export const createNegativeMessage = getMessageCreator({
    embed: { color: DISCORD_MESSAGE_NEGATIVE_COLOR },
    kind: EMessageKind.NEGATIVE,
});

/**
 * Use to signify that something unexpected occured. (eg. result found in search engine but not in DB, DB connection error)
 */
export const createErrorMessage = getMessageCreator({
    embed: { color: DISCORD_MESSAGE_ERROR_COLOR },
    kind: EMessageKind.ERROR,
    content: `-# Everyone point and laugh at ${NOTABOT_DISCORD_MENTION}! ${DISCORD_SAI_LAUGH_EMOJI_CALL}`,
});
