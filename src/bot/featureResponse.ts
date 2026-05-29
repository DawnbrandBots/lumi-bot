import { type BaseMessageOptions } from "discord.js";
import {
    DISCORD_MESSAGE_ERROR_COLOR,
    DISCORD_MESSAGE_NEGATIVE_COLOR,
    DISCORD_MESSAGE_NEUTRAL_COLOR,
    DISCORD_MESSAGE_POSITIVE_COLOR,
    DISCORD_SAI_LAUGH_EMOJI_CALL,
    NOTABOT_DISCORD_MENTION,
} from "./constants.ts";
import type { IChildFeatureReponseArg, IChildFeatureReponseGetterArg, IFeatureReponseArg } from "./types.ts";
import { EFeatureResponseKind } from "./types.ts";

/**
 * Formats a single message sent Discord. All content should reside within a single embed.
 */
function featureResponse<MessageOptions extends BaseMessageOptions = BaseMessageOptions>({
    kind,
    embed,
    ...messageOptions
}: IFeatureReponseArg<MessageOptions>) {
    return { kind, embeds: [embed], ...messageOptions };
}

const getFeatureResponseGetter =
    <MessageOptions extends BaseMessageOptions = BaseMessageOptions>(
        cons: IChildFeatureReponseGetterArg<MessageOptions>,
    ) =>
        (arg: IChildFeatureReponseArg<MessageOptions>) =>
            featureResponse<MessageOptions>({
                ...cons,
                ...arg,
                embed: { ...cons.embed, ...arg.embed },
            });

// Positive, neutral and negative formatters are used when the feature runs without errors.

export const positiveFeatureResponse = getFeatureResponseGetter({
    embed: { color: DISCORD_MESSAGE_POSITIVE_COLOR },
    kind: EFeatureResponseKind.POSITIVE,
});

export const neutralFeatureResponse = getFeatureResponseGetter({
    embed: { color: DISCORD_MESSAGE_NEUTRAL_COLOR },
    kind: EFeatureResponseKind.NEUTRAL,
});

export const negativeFeatureResponse = getFeatureResponseGetter({
    embed: { color: DISCORD_MESSAGE_NEGATIVE_COLOR },
    kind: EFeatureResponseKind.NEGATIVE,
});

export const errorFeatureResponse = getFeatureResponseGetter({
    embed: {
        color: DISCORD_MESSAGE_ERROR_COLOR,
    },
    content: `-# Everyone point and laugh at ${NOTABOT_DISCORD_MENTION}! ${DISCORD_SAI_LAUGH_EMOJI_CALL}`,
    kind: EFeatureResponseKind.ERROR,
});
