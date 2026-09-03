import type { TAllCommandRegistrationData } from "../../presentation/discord/commandRegistrationData.ts";
import type { adminCommandCommandRegistrationData } from "../../presentation/discord/commandRegistrationData/admin.ts";
import type { lfgCommandCommandRegistrationData } from "../../presentation/discord/commandRegistrationData/lfg.ts";
import type { lfgManageCommandCommandRegistrationData } from "../../presentation/discord/commandRegistrationData/lfgManage.ts";
import { lfgChannel } from "../../presentation/discord/commands/admin/lfg/channel.ts";
import { lfgRole } from "../../presentation/discord/commands/admin/lfg/role.ts";
import { lfgRolePingCooldown } from "../../presentation/discord/commands/admin/lfg/rolePingCooldown.ts";
import { lfgShow } from "../../presentation/discord/commands/admin/lfg/show.ts";
import { help } from "../../presentation/discord/commands/help.ts";
import { changeCode as changeOwnedRoomCode } from "../../presentation/discord/commands/lfg/changeCode.ts";
import { create as createOwnedLfgRoom } from "../../presentation/discord/commands/lfg/create.ts";
import { disband as disbandOwnedRoom } from "../../presentation/discord/commands/lfg/disband.ts";
import { help as lfgHelp } from "../../presentation/discord/commands/lfg/help.ts";
import { join as joinLfgRoom } from "../../presentation/discord/commands/lfg/join.ts";
import { kick as kickFromOwnedRoom } from "../../presentation/discord/commands/lfg/kick.ts";
import { leave } from "../../presentation/discord/commands/lfg/leave.ts";
import { ping as pingLfgRole } from "../../presentation/discord/commands/lfg/ping.ts";
import { status } from "../../presentation/discord/commands/lfg/status.ts";
import { transfer as transferOwnedRoom } from "../../presentation/discord/commands/lfg/transfer.ts";
import { changeCode as changeRoomCode } from "../../presentation/discord/commands/lfgManage/changeCode.ts";
import { create as createManagedLfgRoom } from "../../presentation/discord/commands/lfgManage/create.ts";
import { disband as disbandManagedLfgRoom } from "../../presentation/discord/commands/lfgManage/disband.ts";
import { kick as kickFromManagedLfgRoom } from "../../presentation/discord/commands/lfgManage/kick.ts";
import { move } from "../../presentation/discord/commands/lfgManage/move.ts";
import { transfer as transferManagedLfgRoom } from "../../presentation/discord/commands/lfgManage/transfer.ts";
import { links } from "../../presentation/discord/commands/links.ts";
import { runLfgFeatureCommand } from "../../presentation/discord/commands/runLfgFeatureCommand.ts";
import { runLfgManageFeatureCommand } from "../../presentation/discord/commands/runLfgManageFeatureCommand.ts";
import { search } from "../../presentation/discord/commands/search.ts";
import type { TCommandRunHandlers, TCommandRunRegistry } from "../../presentation/discord/commands/types.ts";
import withAdminPermission from "../../presentation/discord/commands/withAdminPermission.ts";

// TODO: good enough for now to have moved built command registries from src/presentation/ to here,
// however the higher order functions should definitely be applied in DRYer way
// and probably in a composition function too rather than being exported as is

export const ADMIN_COMMANDS = {
    lfg: {
        channel: withAdminPermission(lfgChannel),
        role: withAdminPermission(lfgRole),
        "role-ping-cooldown": withAdminPermission(lfgRolePingCooldown),
        show: withAdminPermission(lfgShow),
    },
} satisfies TCommandRunHandlers<typeof adminCommandCommandRegistrationData>;

export const LFG_COMMANDS = {
    create: runLfgFeatureCommand(createOwnedLfgRoom),
    "change-code": runLfgFeatureCommand(changeOwnedRoomCode),
    join: runLfgFeatureCommand(joinLfgRoom),
    transfer: runLfgFeatureCommand(transferOwnedRoom),
    kick: runLfgFeatureCommand(kickFromOwnedRoom),
    leave: runLfgFeatureCommand(leave),
    disband: runLfgFeatureCommand(disbandOwnedRoom),
    status: runLfgFeatureCommand(status),
    help: runLfgFeatureCommand(lfgHelp),
    ping: runLfgFeatureCommand(pingLfgRole),
} satisfies TCommandRunHandlers<typeof lfgCommandCommandRegistrationData>;

export const LFG_MANAGE_COMMANDS = {
    create: runLfgManageFeatureCommand(createManagedLfgRoom),
    move: runLfgManageFeatureCommand(move),
    "change-code": runLfgManageFeatureCommand(changeRoomCode),
    kick: runLfgManageFeatureCommand(kickFromManagedLfgRoom),
    transfer: runLfgManageFeatureCommand(transferManagedLfgRoom),
    disband: runLfgManageFeatureCommand(disbandManagedLfgRoom),
} satisfies TCommandRunHandlers<typeof lfgManageCommandCommandRegistrationData>;

export const COMMANDS = {
    admin: ADMIN_COMMANDS,
    lfg: LFG_COMMANDS,
    "lfg-manage": LFG_MANAGE_COMMANDS,
    search,
    help,
    links,
} satisfies TCommandRunRegistry<TAllCommandRegistrationData>;

export default COMMANDS;
