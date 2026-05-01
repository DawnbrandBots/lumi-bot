import { CommandInfo, ICommandInfo } from "./base.js"


export const helpCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo) {
        return baseInfo
    },
    name: "help",
    description: "Lorem ipsum dolor sit amet",
})