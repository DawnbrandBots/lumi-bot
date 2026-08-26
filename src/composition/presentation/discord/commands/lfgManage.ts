import type { TAdminUseCases } from "../../../../application/admin/useCases.types.ts";
import type { TLfgResult } from "../../../../application/lfg/types.ts";
import type { TLfgUseCases } from "../../../../application/lfg/useCases.types.ts";
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
import { move } from "../../../../presentation/discord/commands/lfgManage/move.ts";
import { transfer as transferManagedLfgRoom } from "../../../../presentation/discord/commands/lfgManage/transfer.ts";
import type { TLfgManageCommandArgs } from "../../../../presentation/discord/commands/lfgManage/types.ts";
import { runLfgSubcommand } from "../../../../presentation/discord/commands/runLfgSubcommand.ts";
import type {
    TCommandHandlers,
    TCommandRunHandler,
    TCommandRunHandlers,
    TGuildCommandInteraction,
} from "../../../../presentation/discord/commands/types.ts";
import { runWithGuild, type TRunWithGuildArg } from "../../../../presentation/discord/utils/runWithGuild.ts";
import type { MaybePromise } from "../../../../utils/types.ts";

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
        useCases: {
            admin: {
                getGuildConfig: arg.adminUseCases.getGuildConfig,
            },
            lfg: {
                changeRoomCode: arg.lfgUseCases.changeRoomCode,
                createRoom: arg.lfgUseCases.createRoom,
                disbandRoom: arg.lfgUseCases.disbandRoom,
                kickPlayerFromRoom: arg.lfgUseCases.kickPlayerFromRoom,
                movePlayerToRoom: arg.lfgUseCases.movePlayerToRoom,
                transferRoomToPlayer: arg.lfgUseCases.transferRoomToPlayer,
            },
        },
    } satisfies TLfgManageCommandArgs;

    return {
        run: composeLfgManageRunHandlers(lfgManageCommandArgs),
        autocomplete: getLfgManageAutocomplete({ getLfgStatus: arg.lfgUseCases.getLfgStatus }),
    } satisfies TCommandHandlers<typeof lfgManageCommandCommandRegistrationData>;
}
