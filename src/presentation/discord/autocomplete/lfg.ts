import type { TCommandAutocompleteHandlers } from "../commands/types.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_NAME,
} from "../commands/lfg/constants.ts";
import type { TGetLfgStatus } from "../../../application/lfg/types.ts";
import getRoomCodeAutocomplete from "./roomCode.ts";
import type { lfgCommandCommandRegistrationData } from "../commandRegistrationData/lfg.ts";

export function getLfgAutocomplete({ getLfgStatus }: { readonly getLfgStatus: TGetLfgStatus }) {
    return {
        [LFG_JOIN_SUBCOMMAND_NAME]: {
            [LFG_CODE_OPTION_NAME]: getRoomCodeAutocomplete({
                getLfgStatus,
                ignoredSubCommands: [LFG_CREATE_SUBCOMMAND_NAME],
            }),
        },
    } satisfies TCommandAutocompleteHandlers<typeof lfgCommandCommandRegistrationData>;
}
