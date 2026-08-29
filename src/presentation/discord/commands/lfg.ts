import type { TLfgResult } from "../../../application/lfg/types.ts";
import type { MaybePromise } from "../../../utils/types.ts";
import type { lfgCommandCommandRegistrationData } from "../commandRegistrationData/lfg.ts";
import { runWithGuild, type TRunWithGuildArg } from "../utils/runWithGuild.ts";
import { changeCode as changeOwnedRoomCode } from "./lfg/changeCode.ts";
import {
    LFG_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_DISBAND_SUBCOMMAND_NAME,
    LFG_HELP_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_PING_SUBCOMMAND_NAME,
    LFG_STATUS_SUBCOMMAND_NAME,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "./lfg/constants.ts";
import { create as createOwnedLfgRoom } from "./lfg/create.ts";
import { disband as disbandOwnedRoom } from "./lfg/disband.ts";
import { help as lfgHelp } from "./lfg/help.ts";
import { join as joinLfgRoom } from "./lfg/join.ts";
import { kick as kickFromOwnedRoom } from "./lfg/kick.ts";
import { leave } from "./lfg/leave.ts";
import { ping as pingLfgRole } from "./lfg/ping.ts";
import { status } from "./lfg/status.ts";
import { transfer as transferOwnedRoom } from "./lfg/transfer.ts";
import type { TLfgCommandArgs } from "./lfg/types.ts";
import { runLfgSubcommand } from "./runLfgSubcommand.ts";
import type { TCommandRunHandler, TCommandRunHandlers, TGuildCommandInteraction } from "./types.ts";

type TLfgFeatureCommand = (arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) => MaybePromise<TLfgResult>;

function runLfgWithGuild(arg: Omit<TRunWithGuildArg, "notInGuildMessageEmbeddescription">) {
    return runWithGuild({ ...arg, notInGuildMessageEmbeddescription: "LFG is only available in servers." });
}

function runLfgFeatureCommand(command: TLfgFeatureCommand): TCommandRunHandler {
    return (arg, interaction) =>
        runLfgWithGuild({
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

// TODO: runLfgFeatureCommand will have to be called somewhere else to remove duplication
export const LFG_COMMANDS = {
    [LFG_CREATE_SUBCOMMAND_NAME]: runLfgFeatureCommand(createOwnedLfgRoom),
    [LFG_CHANGE_CODE_SUBCOMMAND_NAME]: runLfgFeatureCommand(changeOwnedRoomCode),
    [LFG_JOIN_SUBCOMMAND_NAME]: runLfgFeatureCommand(joinLfgRoom),
    [LFG_TRANSFER_SUBCOMMAND_NAME]: runLfgFeatureCommand(transferOwnedRoom),
    [LFG_KICK_SUBCOMMAND_NAME]: runLfgFeatureCommand(kickFromOwnedRoom),
    [LFG_LEAVE_SUBCOMMAND_NAME]: runLfgFeatureCommand(leave),
    [LFG_DISBAND_SUBCOMMAND_NAME]: runLfgFeatureCommand(disbandOwnedRoom),
    [LFG_STATUS_SUBCOMMAND_NAME]: runLfgFeatureCommand(status),
    [LFG_HELP_SUBCOMMAND_NAME]: runLfgFeatureCommand(lfgHelp),
    [LFG_PING_SUBCOMMAND_NAME]: runLfgFeatureCommand(pingLfgRole),
} satisfies TCommandRunHandlers<typeof lfgCommandCommandRegistrationData>;
