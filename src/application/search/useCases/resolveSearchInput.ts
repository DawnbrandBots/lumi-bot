import { SEARCH_MAX_INPUT_LENGTH } from "../constants.ts";
import { ESearchResultKind, type TSearchUseCaseBase } from "../types.ts";

export const resolveSearchInput: TSearchUseCaseBase<
    "resolveSearchInput",
    "queries.search.getBestSearchIndexEntry" | "queries.search.getEntityByKindAndId"
> = async function (dependencies, input) {
    if (input.length > SEARCH_MAX_INPUT_LENGTH) {
        return { kind: ESearchResultKind.INPUT_TOO_LONG };
    }

    const searchItem = await dependencies.queries.search.getBestSearchIndexEntry(input);

    if (!searchItem) {
        return { kind: ESearchResultKind.NO_RESULT };
    }

    const entity = await dependencies.queries.search.getEntityByKindAndId(searchItem);

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
};
