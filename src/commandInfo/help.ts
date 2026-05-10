import { BOT_NAME } from "../constants.ts"
import { CommandInfo, ICommandInfo } from "./base.js"


export const helpCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo) {
        return baseInfo
    },
    name: "help",
    description: `Displays help for ${BOT_NAME} bot.`,
})