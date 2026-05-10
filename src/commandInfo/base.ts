import {
    ApplicationIntegrationType,
    InteractionContextType,
    SharedSlashCommand,
    SlashCommandBuilder,
} from "discord.js";

export interface ICommandInfo {
    readonly info: ReturnType<SharedSlashCommand["toJSON"]>;
    readonly name: string;
    readonly description: string;
    readonly customInfo: (this: ICommandInfo, baseInfo: SlashCommandBuilder) => SharedSlashCommand;
}

export class CommandInfo {
    public readonly name: ICommandInfo["name"];
    public readonly description: ICommandInfo["description"];
    public readonly customInfo: ICommandInfo["customInfo"];

    public constructor(arg: Omit<ICommandInfo, "info">) {
        this.name = arg.name;
        this.description = arg.description;
        this.customInfo = arg.customInfo;
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
