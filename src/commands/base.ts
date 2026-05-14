import type { CacheType, ChatInputCommandInteraction, InteractionResponse } from "discord.js";
import type { ICommandInfo } from "../commandInfo/base.ts";

export interface ICommand {
    readonly info: ICommandInfo;
    /**
     * What the command does. Must reply to the interaction.
     */
    readonly run: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<InteractionResponse<boolean>>;
}

export class Command implements ICommand {
    public readonly info: ICommand["info"];
    public readonly run: ICommand["run"];

    public constructor(arg: ICommand) {
        this.info = arg.info;
        this.run = arg.run;
    }
}
