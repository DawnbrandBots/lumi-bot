import type {
    APIEmbed,
    ApplicationCommandOptionChoiceData,
    ApplicationIntegrationType,
    AutocompleteInteraction,
    BaseMessageOptions,
    CacheType,
    ChatInputCommandInteraction,
    InteractionContextType,
    InteractionResponse,
    SharedSlashCommand,
    SlashCommandBuilder,
} from "discord.js";
import type { MaybePromise } from "../utils/types.ts";

/**
 * Holds info about a command. Info may then be displayed while using the command or in help commands' output.
 */
export interface ICommandInfo {
    /**
     * Object with info about the command to be included in payload to register commands.
     */
    readonly registerCommandInfo: ReturnType<SharedSlashCommand["toJSON"]>;
    readonly name: string;
    /**
     * Briefly explains what the command does.
     */
    readonly description: string;
    readonly contexts: InteractionContextType[];
    readonly integrationTypes: ApplicationIntegrationType[];
    /**
     * Additional info about the command to be registered.
     */
    readonly customInfo: (this: ICommandInfo, baseInfo: SlashCommandBuilder) => SharedSlashCommand;
    /**
     * Describes how to format a message pinging the bot to use the feature.
     */
    readonly pingEquivalent?: string;
}

/**
 * Represents a Discord slash command.
 */
export interface ICommand {
    readonly info: ICommandInfo;
    /**
     * What the command does. Must reply to the interaction.
     */
    readonly run: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<InteractionResponse<boolean>>;
    /**
     * Provides autocomplete suggestions for the command's options.
     */
    readonly autocomplete?: (
        interaction: AutocompleteInteraction<CacheType>,
    ) => MaybePromise<ApplicationCommandOptionChoiceData[] | null>;
}

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

export type IBaseMessageArg<MessageOptions extends BaseMessageOptions = BaseMessageOptions> = Omit<
    MessageOptions,
    TMessageOptionsUnusedProperties
> &
    IBaseMessageArgCustomProps;

export type IChildMessageArg<MessageOptions extends BaseMessageOptions = BaseMessageOptions> = Omit<
    MessageOptions,
    TMessageOptionsUnusedProperties
> &
    IChildMessageArgCustomProps;
