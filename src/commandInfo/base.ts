import type { SharedSlashCommand } from "discord.js";
import { ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder } from "discord.js";

export interface ICommandInfo {
    /**
     * Object with info about the command to be included in payload to register commands.
     */
    readonly info: ReturnType<SharedSlashCommand["toJSON"]>;
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

export class CommandInfo {
    public readonly name: ICommandInfo["name"];
    public readonly description: ICommandInfo["description"];
    public readonly customInfo: ICommandInfo["customInfo"];
    public readonly pingEquivalent: ICommandInfo["pingEquivalent"];

    public constructor(arg: Omit<ICommandInfo, "info">) {
        this.name = arg.name;
        this.description = arg.description;
        this.customInfo = arg.customInfo;
        this.pingEquivalent = arg.pingEquivalent;
    }

    public get info(): ICommandInfo["info"] {
        return this.customInfo(this.baseInfo).toJSON();
    }

    protected get baseInfo(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
            .setContexts(
                InteractionContextType.Guild,
                InteractionContextType.BotDM,
                InteractionContextType.PrivateChannel,
            )
            .setName(this.name)
            .setDescription(this.description);
    }
}
