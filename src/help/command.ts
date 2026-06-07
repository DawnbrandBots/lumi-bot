import { Command } from "../bot/command.ts";
import { EBotFeatureRequestKind } from "../bot/featureRequest.ts";
import type { ICommand } from "../bot/types.ts";
import { helpCommandInfo } from "./commandInfo.ts";

export const helpCommand: ICommand = new Command({
    info: helpCommandInfo,
    request: () => ({ kind: EBotFeatureRequestKind.HELP }),
});
