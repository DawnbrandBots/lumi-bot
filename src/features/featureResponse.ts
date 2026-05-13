import type { BaseMessageOptions, Colors } from "discord.js";
import { type APIEmbed } from "discord.js";
import {
    DISCORD_BLACK_SAI_LAUGH_EMOJI_CALL,
    DISCORD_MESSAGE_ERROR_COLOR,
    DISCORD_MESSAGE_NEUTRAL_COLOR,
    DISCORD_MESSAGE_SUCCESS_COLOR,
    NOTABOT_DISCORD_MENTION,
} from "../models/discord/constants.ts";

export type TFeatureResponseContent = BaseMessageOptions["content"];
export type TFeatureResponseColor = (typeof Colors)[keyof typeof Colors];
export type TFeatureEmbed = Omit<APIEmbed, "color">;

export type IFeatureResponse = BaseMessageOptions;
export type IFeatureReponseCtorArg = {
    embed: TFeatureEmbed;
    color: TFeatureResponseColor;
    content?: TFeatureResponseContent;
};
export type ISubFeatureReponseCtorArg = Omit<IFeatureReponseCtorArg, "color">;

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
            ? `-# Everyone point and laugh at ${NOTABOT_DISCORD_MENTION}! ${DISCORD_BLACK_SAI_LAUGH_EMOJI_CALL}`
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
