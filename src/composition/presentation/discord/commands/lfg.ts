import type { TApplicationUseCases } from "../../../../application/useCases.types.ts";
import type { TLfgResult } from "../../../../application/lfg/types.ts";
import { getLfgAutocomplete } from "../../../../presentation/discord/autocomplete/lfg.ts";
import type { lfgCommandCommandRegistrationData } from "../../../../presentation/discord/commandRegistrationData/lfg.ts";
import { changeCode as changeOwnedRoomCode } from "../../../../presentation/discord/commands/lfg/changeCode.ts";
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
import { disband as disbandOwnedRoom } from "../../../../presentation/discord/commands/lfg/disband.ts";
import { help as lfgHelp } from "../../../../presentation/discord/commands/lfg/help.ts";
import { join as joinLfgRoom } from "../../../../presentation/discord/commands/lfg/join.ts";
import { kick as kickFromOwnedRoom } from "../../../../presentation/discord/commands/lfg/kick.ts";
import { leave } from "../../../../presentation/discord/commands/lfg/leave.ts";
import { ping as pingLfgRole } from "../../../../presentation/discord/commands/lfg/ping.ts";
import { status } from "../../../../presentation/discord/commands/lfg/status.ts";
import { transfer as transferOwnedRoom } from "../../../../presentation/discord/commands/lfg/transfer.ts";
import type { TLfgCommandArgs } from "../../../../presentation/discord/commands/lfg/types.ts";
import { runLfgSubcommand } from "../../../../presentation/discord/commands/runLfgSubcommand.ts";
import type {
    TCommandHandlers,
    TCommandRunHandler,
    TCommandRunHandlers,
    TGuildCommandInteraction,
} from "../../../../presentation/discord/commands/types.ts";
import { runWithGuild, type TRunWithGuildArg } from "../../../../presentation/discord/utils/runWithGuild.ts";
import type { MaybePromise } from "../../../../utils/types.ts";

type TLfgFeatureCommand = (arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) => MaybePromise<TLfgResult>;

function runLfgWithGuild(arg: Omit<TRunWithGuildArg, "notInGuildMessageEmbeddescription">) {
    return runWithGuild({ ...arg, notInGuildMessageEmbeddescription: "LFG is only available in servers." });
}

function composeLfgFeatureHandler(arg: TLfgCommandArgs, command: TLfgFeatureCommand): TCommandRunHandler {
    return (interaction) =>
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

function composeLfgRunHandlers(arg: TLfgCommandArgs) {
    return {
        [LFG_CREATE_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, createOwnedLfgRoom),
        [LFG_CHANGE_CODE_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, changeOwnedRoomCode),
        [LFG_JOIN_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, joinLfgRoom),
        [LFG_TRANSFER_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, transferOwnedRoom),
        [LFG_KICK_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, kickFromOwnedRoom),
        [LFG_LEAVE_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, leave),
        [LFG_DISBAND_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, disbandOwnedRoom),
        [LFG_STATUS_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, status),
        [LFG_HELP_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, lfgHelp),
        [LFG_PING_SUBCOMMAND_NAME]: composeLfgFeatureHandler(arg, pingLfgRole),
    } satisfies TCommandRunHandlers<typeof lfgCommandCommandRegistrationData>;
}

export function composeLfgCommand(arg: { readonly useCases: TApplicationUseCases }) {
    const lfgCommandArgs = { useCases: arg.useCases } satisfies TLfgCommandArgs;

    return {
        run: composeLfgRunHandlers(lfgCommandArgs),
        autocomplete: getLfgAutocomplete({ getLfgStatus: arg.useCases.lfg.getLfgStatus }),
    } satisfies TCommandHandlers<typeof lfgCommandCommandRegistrationData>;
}
