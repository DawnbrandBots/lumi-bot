import { type APIEmbed } from "discord.js";
import {
    DISCORD_MESSAGE_ERROR_COLOR,
    DISCORD_MESSAGE_NEGATIVE_COLOR,
    DISCORD_MESSAGE_NEUTRAL_COLOR,
    DISCORD_MESSAGE_POSITIVE_COLOR,
    DISCORD_SAI_LAUGH_EMOJI_CALL,
    NOTABOT_DISCORD_MENTION,
} from "./constants.ts";
import type {
    IFeatureReponseCtorArg,
    IFeatureResponse,
    ISubFeatureReponseCtorArg,
    TFeatureResponseContent,
} from "./types.ts";
import { EFeatureResponseKind } from "./types.ts";

export default abstract class FeatureResponse implements IFeatureResponse {
    public readonly content?: TFeatureResponseContent;
    public readonly embeds: APIEmbed[];
    public abstract readonly kind: EFeatureResponseKind;

    public constructor({ embed, color, content }: IFeatureReponseCtorArg) {
        this.embeds = [{ ...embed, color }];
        this.content = content;
    }
}

export class PositiveFeatureResponse extends FeatureResponse implements IFeatureResponse {
    public readonly kind = EFeatureResponseKind.POSITIVE;

    public constructor(arg: ISubFeatureReponseCtorArg) {
        super({ ...arg, color: DISCORD_MESSAGE_POSITIVE_COLOR });
    }
}

export class NegativeFeatureResponse extends FeatureResponse implements IFeatureResponse {
    public readonly kind = EFeatureResponseKind.NEGATIVE;

    public constructor(arg: ISubFeatureReponseCtorArg) {
        super({ ...arg, color: DISCORD_MESSAGE_NEGATIVE_COLOR });
    }
}

export class NeutralFeatureResponse extends FeatureResponse implements IFeatureResponse {
    public readonly kind = EFeatureResponseKind.NEUTRAL;

    public constructor(arg: ISubFeatureReponseCtorArg) {
        super({ ...arg, color: DISCORD_MESSAGE_NEUTRAL_COLOR });
    }
}

export class ErrorFeatureResponse extends FeatureResponse implements IFeatureResponse {
    public readonly kind = EFeatureResponseKind.ERROR;

    public constructor({ embed }: ISubFeatureReponseCtorArg) {
        super({
            embed,
            color: DISCORD_MESSAGE_ERROR_COLOR,
            content: `-# Everyone point and laugh at ${NOTABOT_DISCORD_MENTION}! ${DISCORD_SAI_LAUGH_EMOJI_CALL}`,
        });
    }
}
