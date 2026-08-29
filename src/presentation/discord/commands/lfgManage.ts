import type { TLfgResult } from "../../../application/lfg/types.ts";
import type { lfgManageCommandCommandRegistrationData } from "../commandRegistrationData/lfgManage.ts";
import { changeCode as changeRoomCode } from "./lfgManage/changeCode.ts";
import {
    LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_MANAGE_CREATE_SUBCOMMAND_NAME,
    LFG_MANAGE_DISBAND_SUBCOMMAND_NAME,
    LFG_MANAGE_KICK_SUBCOMMAND_NAME,
    LFG_MANAGE_MOVE_SUBCOMMAND_NAME,
    LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME,
} from "./lfgManage/constants.ts";
import { create as createManagedLfgRoom } from "./lfgManage/create.ts";
import { disband as disbandManagedLfgRoom } from "./lfgManage/disband.ts";
import { kick as kickFromManagedLfgRoom } from "./lfgManage/kick.ts";
import { move } from "./lfgManage/move.ts";
import { transfer as transferManagedLfgRoom } from "./lfgManage/transfer.ts";
import type { TLfgManageCommandArgs } from "./lfgManage/types.ts";
import { runLfgSubcommand } from "./runLfgSubcommand.ts";
import type { TCommandRunHandler, TCommandRunHandlers, TGuildCommandInteraction } from "./types.ts";
import { runWithGuild, type TRunWithGuildArg } from "../utils/runWithGuild.ts";
import type { MaybePromise } from "../../../utils/types.ts";

type TLfgManageFeatureCommand = (
    arg: TLfgManageCommandArgs,
    interaction: TGuildCommandInteraction,
) => MaybePromise<TLfgResult>;

function runLfgManageWithGuild(arg: Omit<TRunWithGuildArg, "notInGuildMessageEmbeddescription">) {
    return runWithGuild({ ...arg, notInGuildMessageEmbeddescription: "LFG management is only available in servers." });
}

function runLfgManageFeatureCommand(command: TLfgManageFeatureCommand): TCommandRunHandler {
    return (arg, interaction) =>
        runLfgManageWithGuild({
            interaction,
            run: async (guildInteraction) => {
                const configResult = await arg.useCases.admin.getGuildConfig({ guildId: guildInteraction.guildId });
                await runLfgSubcommand({
                    guildConfig: configResult.value,
                    interaction: guildInteraction,
                    result: await command(arg, guildInteraction),
                });
            },
        });
}

export const LFG_MANAGE_COMMANDS = {
    [LFG_MANAGE_CREATE_SUBCOMMAND_NAME]: runLfgManageFeatureCommand(createManagedLfgRoom),
    [LFG_MANAGE_MOVE_SUBCOMMAND_NAME]: runLfgManageFeatureCommand(move),
    [LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME]: runLfgManageFeatureCommand(changeRoomCode),
    [LFG_MANAGE_KICK_SUBCOMMAND_NAME]: runLfgManageFeatureCommand(kickFromManagedLfgRoom),
    [LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME]: runLfgManageFeatureCommand(transferManagedLfgRoom),
    [LFG_MANAGE_DISBAND_SUBCOMMAND_NAME]: runLfgManageFeatureCommand(disbandManagedLfgRoom),
} satisfies TCommandRunHandlers<typeof lfgManageCommandCommandRegistrationData>;
