import type { TCommandRunHandlers } from "../../../bot/commands/types.ts";
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
} from "../../../lfg/constants.ts";
import type { lfgCommandCommandRegistrationData } from "../commandRegistrationData/lfg.ts";
import { getLfgChangeCodeHandler } from "./lfg/changeCode.ts";
import { getLfgCreateHandler } from "./lfg/create.ts";
import { getLfgDisbandHandler } from "./lfg/disband.ts";
import { getLfgHelpHandler } from "./lfg/help.ts";
import { getLfgJoinHandler } from "./lfg/join.ts";
import { getLfgKickHandler } from "./lfg/kick.ts";
import { getLfgLeaveHandler } from "./lfg/leave.ts";
import { getLfgPingHandler } from "./lfg/ping.ts";
import { getLfgStatusHandler } from "./lfg/status.ts";
import { getLfgTransferHandler } from "./lfg/transfer.ts";
import type { TLfgCommandArgs } from "./lfg/types.ts";

export function getLfgCommand(arg: TLfgCommandArgs) {
    return {
        [LFG_CREATE_SUBCOMMAND_NAME]: getLfgCreateHandler(arg),
        [LFG_CHANGE_CODE_SUBCOMMAND_NAME]: getLfgChangeCodeHandler(arg),
        [LFG_JOIN_SUBCOMMAND_NAME]: getLfgJoinHandler(arg),
        [LFG_TRANSFER_SUBCOMMAND_NAME]: getLfgTransferHandler(arg),
        [LFG_KICK_SUBCOMMAND_NAME]: getLfgKickHandler(arg),
        [LFG_LEAVE_SUBCOMMAND_NAME]: getLfgLeaveHandler(arg),
        [LFG_DISBAND_SUBCOMMAND_NAME]: getLfgDisbandHandler(arg),
        [LFG_STATUS_SUBCOMMAND_NAME]: getLfgStatusHandler(arg),
        [LFG_HELP_SUBCOMMAND_NAME]: getLfgHelpHandler(arg),
        [LFG_PING_SUBCOMMAND_NAME]: getLfgPingHandler(arg),
    } satisfies TCommandRunHandlers<typeof lfgCommandCommandRegistrationData>;
}
