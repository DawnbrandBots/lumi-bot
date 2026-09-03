import type { TAllCommandRegistrationData } from "../../presentation/discord/commandRegistrationData.ts";
import type { TCommandAutocompleteRegistry } from "../../presentation/discord/commands/types.ts";
import autocompleteRoomCode from "../../presentation/discord/services/lfg/autocompleteRoomCode.ts";
import autocompleteSearchTerms from "../../presentation/discord/services/search/autocompleteSearchTerms.ts";

export const AUTOCOMPLETE = {
    admin: {},
    help: {},
    links: {},
    lfg: { join: { code: autocompleteRoomCode } },
    "lfg-manage": {
        move: { code: autocompleteRoomCode },
        "change-code": { code: autocompleteRoomCode },
        kick: { code: autocompleteRoomCode },
        transfer: { code: autocompleteRoomCode },
        disband: { code: autocompleteRoomCode },
    },
    search: { terms: autocompleteSearchTerms },
} satisfies TCommandAutocompleteRegistry<TAllCommandRegistrationData>;

export default AUTOCOMPLETE;
