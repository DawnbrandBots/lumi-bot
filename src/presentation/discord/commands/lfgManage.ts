import type { TCommandRunHandlers } from "../../../bot/commands/types.ts";
import {
    LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_MANAGE_CREATE_SUBCOMMAND_NAME,
    LFG_MANAGE_DISBAND_SUBCOMMAND_NAME,
    LFG_MANAGE_KICK_SUBCOMMAND_NAME,
    LFG_MANAGE_MOVE_SUBCOMMAND_NAME,
    LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME,
} from "../../../lfgManage/constants.ts";
import type { lfgManageCommandCommandRegistrationData } from "../commandRegistrationData/lfgManage.ts";
import { getLfgManageChangeCodeHandler } from "./lfgManage/changeCode.ts";
import { getLfgManageCreateHandler } from "./lfgManage/create.ts";
import { getLfgManageDisbandHandler } from "./lfgManage/disband.ts";
import { getLfgManageKickHandler } from "./lfgManage/kick.ts";
import { getLfgManageMoveHandler } from "./lfgManage/move.ts";
import { getLfgManageTransferHandler } from "./lfgManage/transfer.ts";
import type { TLfgManageCommandArgs } from "./lfgManage/types.ts";

export function getLfgManageCommand(arg: TLfgManageCommandArgs) {
    return {
        [LFG_MANAGE_CREATE_SUBCOMMAND_NAME]: getLfgManageCreateHandler(arg),
        [LFG_MANAGE_MOVE_SUBCOMMAND_NAME]: getLfgManageMoveHandler(arg),
        [LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME]: getLfgManageChangeCodeHandler(arg),
        [LFG_MANAGE_KICK_SUBCOMMAND_NAME]: getLfgManageKickHandler(arg),
        [LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME]: getLfgManageTransferHandler(arg),
        [LFG_MANAGE_DISBAND_SUBCOMMAND_NAME]: getLfgManageDisbandHandler(arg),
    } satisfies TCommandRunHandlers<typeof lfgManageCommandCommandRegistrationData>;
}
