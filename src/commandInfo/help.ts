import { BOT_NAME } from "../models/discord/constants.ts";
import type { ICommandInfo } from "./base.ts";
import { CommandInfo } from "./base.ts";

export const helpCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo) {
        return baseInfo;
    },
    name: "help",
    description: `Displays help for ${BOT_NAME} bot.`,
    pingEquivalent: `@${BOT_NAME}`,
});
