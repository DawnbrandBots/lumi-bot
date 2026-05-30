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
 * Formats a single message sent Discord. All content should reside within a single embed.
 */
function message<MessageOptions extends BaseMessageOptions = BaseMessageOptions>({
    kind,
    embed,
    ...messageOptions
}: IBaseMessageArg<MessageOptions>) {
    return { kind, embeds: [embed], ...messageOptions };
}

const getMessageGetter =
    <ConstMessageOptions extends BaseMessageOptions = BaseMessageOptions>(cons: IBaseMessageArg<ConstMessageOptions>) =>
        <MessageOptions extends ConstMessageOptions = ConstMessageOptions>(arg: IChildMessageArg<MessageOptions>) =>
            message<MessageOptions>({
                ...cons,
                ...arg,
                embed: { ...cons.embed, ...arg.embed },
            });

// Positive, neutral and negative formatters are used when the feature runs without errors.

export const positiveMessage = getMessageGetter({
    embed: { color: DISCORD_MESSAGE_POSITIVE_COLOR },
    kind: EMessageKind.POSITIVE,
});

export const neutralMessage = getMessageGetter({
    embed: { color: DISCORD_MESSAGE_NEUTRAL_COLOR },
    kind: EMessageKind.NEUTRAL,
});

export const negativeMessage = getMessageGetter({
    embed: { color: DISCORD_MESSAGE_NEGATIVE_COLOR },
    kind: EMessageKind.NEGATIVE,
});

export const errorMessage = getMessageGetter({
    embed: { color: DISCORD_MESSAGE_ERROR_COLOR },
    kind: EMessageKind.ERROR,
    content: `-# Everyone point and laugh at ${NOTABOT_DISCORD_MENTION}! ${DISCORD_SAI_LAUGH_EMOJI_CALL}`,
});
