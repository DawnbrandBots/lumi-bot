import type { TLfgResult } from "../../../../application/lfg/types.ts";
import { getLfgAutocomplete } from "../../../../presentation/discord/autocomplete/lfg.ts";
import type { lfgCommandCommandRegistrationData } from "../../../../presentation/discord/commandRegistrationData/lfg.ts";
import { changeCode as changeOwnedLfgRoomCode } from "../../../../presentation/discord/commands/lfg/changeCode.ts";
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
} from "../../../../presentation/discord/commands/lfg/constants.ts";
import { create as createOwnedLfgRoom } from "../../../../presentation/discord/commands/lfg/create.ts";
import { disband as disbandOwnedLfgRoom } from "../../../../presentation/discord/commands/lfg/disband.ts";
import { help as lfgHelp } from "../../../../presentation/discord/commands/lfg/help.ts";
import { join as joinLfgRoom } from "../../../../presentation/discord/commands/lfg/join.ts";
import { kick as kickFromOwnedLfgRoom } from "../../../../presentation/discord/commands/lfg/kick.ts";
import { leave as leaveLfgRoom } from "../../../../presentation/discord/commands/lfg/leave.ts";
import { ping as pingLfgRole } from "../../../../presentation/discord/commands/lfg/ping.ts";
import { runFeatureSubcommand as runLfgFeatureSubcommand } from "../../../../presentation/discord/commands/lfg/runFeatureSubcommand.ts";
import { status as getLfgStatus } from "../../../../presentation/discord/commands/lfg/status.ts";
import { transfer as transferOwnedLfgRoom } from "../../../../presentation/discord/commands/lfg/transfer.ts";
import type { TLfgCommandArgs } from "../../../../presentation/discord/commands/lfg/types.ts";
import type {
    TCommandHandlers,
    TCommandRunHandler,
    TCommandRunHandlers,
    TGuildCommandInteraction,
} from "../../../../presentation/discord/commands/types.ts";
import { runWithGuild, type TRunWithGuildArg } from "../../../../presentation/discord/utils/runWithGuild.ts";
import type { MaybePromise } from "../../../../utils/types.ts";
import type { TAdminUseCases } from "../../../../application/admin/useCases.types.ts";
import type { TLfgUseCases } from "../../../../application/lfg/useCases.types.ts";

type TLfgFeatureCommand = (arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) => MaybePromise<TLfgResult>;

type TLfgVoidCommand = (arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) => MaybePromise<void>;

type TLfgReplyCommand = (
    arg: TLfgCommandArgs,
    interaction: TGuildCommandInteraction,
) => MaybePromise<Parameters<TGuildCommandInteraction["reply"]>[0]>;

function runLfgWithGuild(arg: Omit<TRunWithGuildArg, "notInGuildMessageEmbeddescription">) {
    return runWithGuild({ ...arg, notInGuildMessageEmbeddescription: "LFG is only available in servers." });
}

function composeLfgFeatureHandler(arg: TLfgCommandArgs, command: TLfgFeatureCommand): TCommandRunHandler {
    return (interaction) =>
        runLfgWithGuild({
            interaction,
            run: (guildInteraction) =>
                runLfgFeatureSubcommand(arg, guildInteraction, () => command(arg, guildInteraction)),
        });
}

function composeLfgReplyHandler(arg: TLfgCommandArgs, command: TLfgReplyCommand): TCommandRunHandler {
    return (interaction) =>
        runLfgWithGuild({
            interaction,
            run: async (guildInteraction) => {
                await guildInteraction.reply(await command(arg, guildInteraction));
            },
        });
}

function composeLfgVoidHandler(arg: TLfgCommandArgs, command: TLfgVoidCommand): TCommandRunHandler {
    return (interaction) =>
        runLfgWithGuild({
            interaction,
            run: async (guildInteraction) => {
                await command(arg, guildInteraction);
            },
        });
}

function composeLfgRunHandlers(arg: TLfgCommandArgs) {
    return {
        [LFG_CREATE_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, createOwnedLfgRoom),
        [LFG_CHANGE_CODE_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, changeOwnedLfgRoomCode),
        [LFG_JOIN_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, joinLfgRoom),
        [LFG_TRANSFER_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, transferOwnedLfgRoom),
        [LFG_KICK_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, kickFromOwnedLfgRoom),
        [LFG_LEAVE_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, leaveLfgRoom),
        [LFG_DISBAND_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, disbandOwnedLfgRoom),
        [LFG_STATUS_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, getLfgStatus),
        [LFG_HELP_SUBCOMMAND_NAME]: composeLfgReplyHandler(arg, lfgHelp),
        [LFG_PING_SUBCOMMAND_NAME]: composeLfgVoidHandler(arg, pingLfgRole),
    } satisfies TCommandRunHandlers<typeof lfgCommandCommandRegistrationData>;
}

export function composeLfgCommand(arg: { readonly adminUseCases: TAdminUseCases; readonly lfgUseCases: TLfgUseCases }) {
    const lfgCommandArgs = {
        getGuildConfig: arg.adminUseCases.getGuildConfig,
        getLfgRoleConfig: arg.adminUseCases.getLfgRoleConfig,
        setLfgRoleLastPingedAt: arg.adminUseCases.setLfgRoleLastPingedAt,
        changeOwnedLfgRoomCode: arg.lfgUseCases.changeOwnedLfgRoomCode,
        createLfgRoom: arg.lfgUseCases.createLfgRoom,
        disbandOwnedLfgRoom: arg.lfgUseCases.disbandOwnedLfgRoom,
        getLfgStatus: arg.lfgUseCases.getLfgStatus,
        kickFromOwnedLfgRoom: arg.lfgUseCases.kickFromOwnedLfgRoom,
        leaveLfgRoom: arg.lfgUseCases.leaveLfgRoom,
        moveLfgUser: arg.lfgUseCases.moveLfgUser,
        transferOwnedLfgRoom: arg.lfgUseCases.transferOwnedLfgRoom,
    } satisfies TLfgCommandArgs;

    return {
        run: composeLfgRunHandlers(lfgCommandArgs),
        autocomplete: getLfgAutocomplete({ getLfgStatus: arg.lfgUseCases.getLfgStatus }),
    } satisfies TCommandHandlers<typeof lfgCommandCommandRegistrationData>;
}
