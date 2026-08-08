import type { TCommandAutocompleteHandlers } from "../commands/types.ts";
import { LFG_CODE_OPTION_NAME } from "../commands/lfg/constants.ts";
import type { LfgFeature } from "../../../lfg/feature.ts";
import getRoomCodeAutocomplete from "./roomCode.ts";
import {
    LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_MANAGE_CREATE_SUBCOMMAND_NAME,
    LFG_MANAGE_DISBAND_SUBCOMMAND_NAME,
    LFG_MANAGE_KICK_SUBCOMMAND_NAME,
    LFG_MANAGE_MOVE_SUBCOMMAND_NAME,
    LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME,
} from "../commands/lfgManage/constants.ts";
import type { lfgManageCommandCommandRegistrationData } from "../commandRegistrationData/lfgManage.ts";

export function getLfgManageAutocomplete({ lfgFeature }: { readonly lfgFeature: LfgFeature }) {
    const autocompleteCode = getRoomCodeAutocomplete({
        lfgFeature,
        ignoredSubCommands: [LFG_MANAGE_CREATE_SUBCOMMAND_NAME],
    });

    return {
        [LFG_MANAGE_MOVE_SUBCOMMAND_NAME]: {
            [LFG_CODE_OPTION_NAME]: autocompleteCode,
        },
        [LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME]: {
            [LFG_CODE_OPTION_NAME]: autocompleteCode,
        },
        [LFG_MANAGE_KICK_SUBCOMMAND_NAME]: {
            [LFG_CODE_OPTION_NAME]: autocompleteCode,
        },
        [LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME]: {
            [LFG_CODE_OPTION_NAME]: autocompleteCode,
        },
        [LFG_MANAGE_DISBAND_SUBCOMMAND_NAME]: {
            [LFG_CODE_OPTION_NAME]: autocompleteCode,
        },
    } satisfies TCommandAutocompleteHandlers<typeof lfgManageCommandCommandRegistrationData>;
}
