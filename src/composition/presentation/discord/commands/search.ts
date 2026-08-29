import { getSearchAutocomplete } from "../../../../presentation/discord/autocomplete/search.ts";
import type { searchCommandCommandRegistrationData } from "../../../../presentation/discord/commandRegistrationData/search.ts";
import { getSearchCommand } from "../../../../presentation/discord/commands/search.ts";
import type { TCommandHandlers } from "../../../../presentation/discord/commands/types.ts";
import type { TApplicationUseCases } from "../../../../application/useCases.types.ts";

export function composeSearchCommand(useCases: TApplicationUseCases) {
    return {
        run: getSearchCommand({ useCases }),
        autocomplete: getSearchAutocomplete({ suggestSearchResults: useCases.search.suggestSearchResults }),
    } satisfies TCommandHandlers<typeof searchCommandCommandRegistrationData>;
}
