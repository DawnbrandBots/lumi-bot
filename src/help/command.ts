import { Command } from "../bot/command.ts";
import { EBotRequestKind } from "../bot/request.ts";
import type { ICommand } from "../bot/types.ts";
import { helpCommandInfo } from "./commandInfo.ts";

export const helpCommand: ICommand = new Command({
    info: helpCommandInfo,
    request: () => ({ kind: EBotRequestKind.HELP }),
});
