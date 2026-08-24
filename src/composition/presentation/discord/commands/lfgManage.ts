import type { TLfgResult } from "../../../../application/lfg/types.ts";
import { getLfgManageAutocomplete } from "../../../../presentation/discord/autocomplete/lfgManage.ts";
import type { lfgManageCommandCommandRegistrationData } from "../../../../presentation/discord/commandRegistrationData/lfgManage.ts";
import { changeCode as changeRoomCode } from "../../../../presentation/discord/commands/lfgManage/changeCode.ts";
import {
    LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_MANAGE_CREATE_SUBCOMMAND_NAME,
    LFG_MANAGE_DISBAND_SUBCOMMAND_NAME,
    LFG_MANAGE_KICK_SUBCOMMAND_NAME,
    LFG_MANAGE_MOVE_SUBCOMMAND_NAME,
    LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME,
} from "../../../../presentation/discord/commands/lfgManage/constants.ts";
import { create as createManagedLfgRoom } from "../../../../presentation/discord/commands/lfgManage/create.ts";
import { disband as disbandManagedLfgRoom } from "../../../../presentation/discord/commands/lfgManage/disband.ts";
import { kick as kickFromManagedLfgRoom } from "../../../../presentation/discord/commands/lfgManage/kick.ts";
import { move as move } from "../../../../presentation/discord/commands/lfgManage/move.ts";
import { runFeatureSubcommand as runLfgManageFeatureSubcommand } from "../../../../presentation/discord/commands/lfgManage/runFeatureSubcommand.ts";
import { transfer as transferManagedLfgRoom } from "../../../../presentation/discord/commands/lfgManage/transfer.ts";
import type { TLfgManageCommandArgs } from "../../../../presentation/discord/commands/lfgManage/types.ts";
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

type TLfgManageFeatureCommand = (
    arg: TLfgManageCommandArgs,
    interaction: TGuildCommandInteraction,
) => MaybePromise<TLfgResult>;

function runLfgManageWithGuild(arg: Omit<TRunWithGuildArg, "notInGuildMessageEmbeddescription">) {
    return runWithGuild({ ...arg, notInGuildMessageEmbeddescription: "LFG management is only available in servers." });
}

function composeLfgManageFeatureHandler(
    arg: TLfgManageCommandArgs,
    command: TLfgManageFeatureCommand,
): TCommandRunHandler {
    return (interaction) =>
        runLfgManageWithGuild({
            interaction,
            run: (guildInteraction) =>
                runLfgManageFeatureSubcommand(arg, guildInteraction, () => command(arg, guildInteraction)),
        });
}

function composeLfgManageRunHandlers(arg: TLfgManageCommandArgs) {
    return {
        [LFG_MANAGE_CREATE_SUBCOMMAND_NAME]: composeLfgManageFeatureHandler(arg, createManagedLfgRoom),
        [LFG_MANAGE_MOVE_SUBCOMMAND_NAME]: composeLfgManageFeatureHandler(arg, move),
        [LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME]: composeLfgManageFeatureHandler(arg, changeRoomCode),
        [LFG_MANAGE_KICK_SUBCOMMAND_NAME]: composeLfgManageFeatureHandler(arg, kickFromManagedLfgRoom),
        [LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME]: composeLfgManageFeatureHandler(arg, transferManagedLfgRoom),
        [LFG_MANAGE_DISBAND_SUBCOMMAND_NAME]: composeLfgManageFeatureHandler(arg, disbandManagedLfgRoom),
    } satisfies TCommandRunHandlers<typeof lfgManageCommandCommandRegistrationData>;
}

export function composeLfgManageCommand(arg: {
    readonly adminUseCases: TAdminUseCases;
    readonly lfgUseCases: TLfgUseCases;
}) {
    const lfgManageCommandArgs = {
        getGuildConfig: arg.adminUseCases.getGuildConfig,
        changeRoomCode: arg.lfgUseCases.changeRoomCode,
        create: arg.lfgUseCases.create,
        disband: arg.lfgUseCases.disband,
        kick: arg.lfgUseCases.kick,
        move: arg.lfgUseCases.move,
        transfer: arg.lfgUseCases.transfer,
    } satisfies TLfgManageCommandArgs;

    return {
        run: composeLfgManageRunHandlers(lfgManageCommandArgs),
        autocomplete: getLfgManageAutocomplete({ status: arg.lfgUseCases.status }),
    } satisfies TCommandHandlers<typeof lfgManageCommandCommandRegistrationData>;
}
