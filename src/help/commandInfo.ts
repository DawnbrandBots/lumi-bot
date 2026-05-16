import { CommandInfo } from "../bot/commandInfo.ts";
import { BOT_NAME } from "../bot/constants.ts";
import type { ICommandInfo } from "../bot/types.ts";

export const helpCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo) {
        return baseInfo;
    },
    name: "help",
    description: `Displays help for ${BOT_NAME} bot.`,
    pingEquivalent: `@${BOT_NAME}`,
});
