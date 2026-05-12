import { BOT_NAME } from "../models/discord/constants.ts";
import type { ICommandInfo } from "./base.js";
import { CommandInfo } from "./base.js";

export const helpCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo) {
        return baseInfo;
    },
    name: "help",
    description: `Displays help for ${BOT_NAME} bot.`,
    pingEquivalent: `@${BOT_NAME}`,
});
