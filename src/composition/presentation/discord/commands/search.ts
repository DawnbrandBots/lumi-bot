import { getSearchAutocomplete } from "../../../../presentation/discord/autocomplete/search.ts";
import type { searchCommandCommandRegistrationData } from "../../../../presentation/discord/commandRegistrationData/search.ts";
import { getSearchCommand } from "../../../../presentation/discord/commands/search.ts";
import type { TCommandHandlers } from "../../../../presentation/discord/commands/types.ts";
import type { TSearchUseCases } from "../../../../application/search/useCases.types.ts";

export function composeSearchCommand(searchUseCases: TSearchUseCases) {
    return {
        run: getSearchCommand({ resolveSearchInput: searchUseCases.resolveSearchInput }),
        autocomplete: getSearchAutocomplete({ suggestSearchResults: searchUseCases.suggestSearchResults }),
    } satisfies TCommandHandlers<typeof searchCommandCommandRegistrationData>;
}
