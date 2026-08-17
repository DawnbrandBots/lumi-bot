import { SEARCH_MAX_INPUT_LENGTH } from "./constants.ts";
import type { TGetBestSearchIndexEntry, TGetEntityByKindAndId } from "./ports.ts";
import type { TSearchResult } from "./types.ts";
import { ESearchResultKind } from "./types.ts";

export async function resolveSearchInput(
    deps: {
        getBestSearchIndexEntry: TGetBestSearchIndexEntry;
        getEntityByKindAndId: TGetEntityByKindAndId;
    },
    input: string,
): Promise<TSearchResult> {
    if (input.length > SEARCH_MAX_INPUT_LENGTH) {
        return { kind: ESearchResultKind.INPUT_TOO_LONG };
    }

    const searchItem = await deps.getBestSearchIndexEntry(input);

    if (!searchItem) {
        return { kind: ESearchResultKind.NO_RESULT };
    }

    const entity = await deps.getEntityByKindAndId(searchItem);

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
