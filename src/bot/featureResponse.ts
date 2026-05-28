import { type BaseMessageOptions } from "discord.js";
import {
    DISCORD_MESSAGE_ERROR_COLOR,
    DISCORD_MESSAGE_NEGATIVE_COLOR,
    DISCORD_MESSAGE_NEUTRAL_COLOR,
    DISCORD_MESSAGE_POSITIVE_COLOR,
    DISCORD_SAI_LAUGH_EMOJI_CALL,
    NOTABOT_DISCORD_MENTION,
} from "./constants.ts";
import type { IFeatureReponseCtorArg, ISubFeatureReponseCtorArg } from "./types.ts";
import { EFeatureResponseKind } from "./types.ts";

function featureResponse<MessageOptions extends BaseMessageOptions = BaseMessageOptions>({
    kind,
    color,
    embed,
    ...messageOptions
}: IFeatureReponseCtorArg<MessageOptions>) {
    return { kind, embeds: [{ color, ...embed }], ...messageOptions };
}

export function positiveFeatureResponse<MessageOptions extends BaseMessageOptions = BaseMessageOptions>(
    arg: ISubFeatureReponseCtorArg<MessageOptions>,
) {
    return featureResponse<MessageOptions>({
        ...arg,
        color: DISCORD_MESSAGE_POSITIVE_COLOR,
        kind: EFeatureResponseKind.POSITIVE,
    });
}

export function negativeFeatureResponse<MessageOptions extends BaseMessageOptions = BaseMessageOptions>(
    arg: ISubFeatureReponseCtorArg<MessageOptions>,
) {
    return featureResponse<MessageOptions>({
        ...arg,
        color: DISCORD_MESSAGE_NEGATIVE_COLOR,
        kind: EFeatureResponseKind.NEGATIVE,
    });
}

export function neutralFeatureResponse<MessageOptions extends BaseMessageOptions = BaseMessageOptions>(
    arg: ISubFeatureReponseCtorArg<MessageOptions>,
) {
    return featureResponse<MessageOptions>({
        ...arg,
        color: DISCORD_MESSAGE_NEUTRAL_COLOR,
        kind: EFeatureResponseKind.NEUTRAL,
    });
}

export function errorFeatureResponse<MessageOptions extends BaseMessageOptions = BaseMessageOptions>(
    arg: ISubFeatureReponseCtorArg<MessageOptions>,
) {
    return featureResponse<MessageOptions>({
        ...arg,
        color: DISCORD_MESSAGE_ERROR_COLOR,
        content: `-# Everyone point and laugh at ${NOTABOT_DISCORD_MENTION}! ${DISCORD_SAI_LAUGH_EMOJI_CALL}`,
        kind: EFeatureResponseKind.ERROR,
    });
}
