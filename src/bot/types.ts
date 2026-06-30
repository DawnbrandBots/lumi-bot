import type {
    APIEmbed,
    BaseMessageOptions
} from "discord.js";

export const enum EMessageKind {
    POSITIVE = "POSITIVE",
    NEGATIVE = "NEGATIVE",
    NEUTRAL = "NEUTRAL",
    ERROR = "ERROR",
}

/**
 * Pre-made formatters should already have a color which shouldn't be overidden by the caller.
 */
export type IChildMessageArgCustomProps = {
    embed: Omit<APIEmbed, "color">;
};

export type IBaseMessageArgCustomProps = {
    kind: EMessageKind;
    embed: APIEmbed;
};

export type TMessageOptionsUnusedProperties = "embeds";
export type ISingleEmbedMessageOptions<MessageOptions extends BaseMessageOptions = BaseMessageOptions> = Omit<
    MessageOptions,
    TMessageOptionsUnusedProperties
> & {
    embed: APIEmbed;
};

export type IBaseMessageArg<MessageOptions extends BaseMessageOptions = BaseMessageOptions> =
    ISingleEmbedMessageOptions<MessageOptions> & IBaseMessageArgCustomProps;

export type IChildMessageArg<MessageOptions extends BaseMessageOptions = BaseMessageOptions> =
    ISingleEmbedMessageOptions<MessageOptions> & IChildMessageArgCustomProps;
