import { SEARCH_MAX_INPUT_LENGTH } from "../constants.ts";
import type { TSearchResult } from "../types.ts";
import { ESearchResultKind } from "../types.ts";
import type { TSearchUseCaseDependencies } from "../useCases.types.ts";

export default async function resolveSearchInput(
    dependencies: TSearchUseCaseDependencies,
    input: string,
): Promise<TSearchResult> {
    if (input.length > SEARCH_MAX_INPUT_LENGTH) {
        return { kind: ESearchResultKind.INPUT_TOO_LONG };
    }

    const searchItem = await dependencies.persistence.getBestSearchIndexEntry(input);

    if (!searchItem) {
        return { kind: ESearchResultKind.NO_RESULT };
    }

    const entity = await dependencies.persistence.getEntityByKindAndId(searchItem);

    if (!entity) {
        return {
            kind: ESearchResultKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,
            value: { kind: searchItem.kind, id: searchItem.id },
        };
    }

    return {
        kind: ESearchResultKind.SUCCESS,
        value: { kind: searchItem.kind, entity, searchItem },
    };
}
