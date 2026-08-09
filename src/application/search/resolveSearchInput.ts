import type { TGetEntityByKindAndId } from "../../game/feature.types.ts";
import { SEARCH_MAX_INPUT_LENGTH } from "./constants.ts";
import type { TGetBestSearchIndexEntry } from "./ports.ts";
import type { TSearchFeatureReturn } from "./types.ts";
import { ESearchFeatureReturnKind } from "./types.ts";

export async function resolveSearchInput(
    deps: {
        getBestSearchIndexEntry: TGetBestSearchIndexEntry;
        getEntityByKindAndId: TGetEntityByKindAndId;
    },
    input: string,
): Promise<TSearchFeatureReturn> {
    if (input.length > SEARCH_MAX_INPUT_LENGTH) {
        return { kind: ESearchFeatureReturnKind.INPUT_TOO_LONG };
    }

    const searchItem = await deps.getBestSearchIndexEntry(input);

    if (!searchItem) {
        return { kind: ESearchFeatureReturnKind.NO_RESULT };
    }

    const entity = await deps.getEntityByKindAndId(searchItem);

    if (!entity) {
        return {
            kind: ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,
            value: { kind: searchItem.kind, id: searchItem.id },
        };
    }

    return {
        kind: ESearchFeatureReturnKind.SUCCESS,
        value: { kind: searchItem.kind, entity, searchItem },
    };
}
