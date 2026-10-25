import type { TAllCommandRegistrationData } from "../../presentation/discord/commandRegistrationData.ts";
import type { TCommandAutocompleteRegistry } from "../../presentation/discord/commands/types.ts";
import autocompleteAvailableRoomCode from "../../presentation/discord/services/lfg/autocompleteAvailableRoomCode.ts";
import autocompleteRoomCode from "../../presentation/discord/services/lfg/autocompleteRoomCode.ts";
import autocompleteSearchTerms from "../../presentation/discord/services/search/autocompleteSearchTerms.ts";
import { autocompleteListableItem } from "../../presentation/discord/services/bazaar/autocompleteListableItem.ts";

export const AUTOCOMPLETE = {
    admin: {},
    bazaar: {
        upsert: { purchase: { item: autocompleteListableItem }, sale: { item: autocompleteListableItem } },
        delete: { purchase: { item: autocompleteListableItem }, sale: { item: autocompleteListableItem } },
        list: { purchase: { item: autocompleteListableItem }, sale: { item: autocompleteListableItem } },
    },
    "bazaar-manage": {
        upsert: { purchase: { item: autocompleteListableItem }, sale: { item: autocompleteListableItem } },
        delete: { purchase: { item: autocompleteListableItem }, sale: { item: autocompleteListableItem } },
    },
    help: {},
    links: {},
    lfg: { join: { code: autocompleteAvailableRoomCode } },
    "lfg-manage": {
        move: { code: autocompleteAvailableRoomCode },
        "change-code": { code: autocompleteRoomCode },
        kick: { code: autocompleteRoomCode },
        transfer: { code: autocompleteRoomCode },
        disband: { code: autocompleteRoomCode },
    },
    search: { terms: autocompleteSearchTerms },
} satisfies TCommandAutocompleteRegistry<TAllCommandRegistrationData>;

export default AUTOCOMPLETE;
