import { type APIEmbed } from "discord.js";
import {
    DISCORD_MESSAGE_ERROR_COLOR,
    DISCORD_MESSAGE_NEUTRAL_COLOR,
    DISCORD_MESSAGE_SUCCESS_COLOR,
    DISCORD_SAI_LAUGH_EMOJI_CALL,
    NOTABOT_DISCORD_MENTION,
} from "./constants.ts";
import type {
    IFeatureReponseCtorArg,
    IFeatureResponse,
    ISubFeatureReponseCtorArg,
    TFeatureResponseContent,
} from "./types.ts";

export default abstract class FeatureResponse implements IFeatureResponse {
    public readonly content?: TFeatureResponseContent;
    public readonly embeds: APIEmbed[];

    public constructor({ embed, color, content }: IFeatureReponseCtorArg) {
        this.embeds = [{ ...embed, color }];
        this.content = content;
    }
}

export class SuccessFeatureResponse extends FeatureResponse implements IFeatureResponse {
    public constructor(arg: ISubFeatureReponseCtorArg) {
        super({ ...arg, color: DISCORD_MESSAGE_SUCCESS_COLOR });
    }
}

export class ErrorFeatureResponse extends FeatureResponse implements IFeatureResponse {
    public readonly report: boolean;

    public constructor({
        embed,
        report = false,
    }: ISubFeatureReponseCtorArg & { report?: ErrorFeatureResponse["report"] }) {
        const content = report
            ? `-# Everyone point and laugh at ${NOTABOT_DISCORD_MENTION}! ${DISCORD_SAI_LAUGH_EMOJI_CALL}`
            : undefined;
        super({ embed, color: DISCORD_MESSAGE_ERROR_COLOR, content });
        this.report = report;
    }
}

export class NeutralFeatureResponse extends FeatureResponse implements IFeatureResponse {
    public constructor(arg: ISubFeatureReponseCtorArg) {
        super({ ...arg, color: DISCORD_MESSAGE_NEUTRAL_COLOR });
    }
}
