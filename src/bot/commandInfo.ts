import { ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder } from "discord.js";
import type { ICommandInfo } from "./types.ts";

export class CommandInfo implements ICommandInfo {
    public readonly name: ICommandInfo["name"];
    public readonly description: ICommandInfo["description"];
    public readonly customInfo: ICommandInfo["customInfo"];
    public readonly pingEquivalent: ICommandInfo["pingEquivalent"];

    public constructor(arg: Omit<ICommandInfo, "registerCommandInfo">) {
        this.name = arg.name;
        this.description = arg.description;
        this.customInfo = arg.customInfo;
        this.pingEquivalent = arg.pingEquivalent;
    }

    public get registerCommandInfo(): ICommandInfo["registerCommandInfo"] {
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
