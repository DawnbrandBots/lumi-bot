import type {
    APIEmbed,
    BaseMessageOptions,
    CacheType,
    ChatInputCommandInteraction,
    Colors,
    InteractionResponse,
    SharedSlashCommand,
    SlashCommandBuilder,
} from "discord.js";

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
}

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
