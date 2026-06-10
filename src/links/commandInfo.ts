import { CommandInfo } from "../bot/commandInfo.ts";
import type { ICommandInfo } from "../bot/types.ts";
import { LINKS_COMMAND_NAME } from "./constants.ts";

export const linksCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: (baseInfo) => baseInfo,
    name: LINKS_COMMAND_NAME,
    description: "Displays official Fire Emblem Shadows links.",
});
