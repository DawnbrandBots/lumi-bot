import type { TGetEntityByKindAndId } from "../../game/feature.types.ts";
import type { TGetBestSearchIndexEntry } from "../../search/infra.types.ts";
import type { TSearchFeatureReturn } from "../../search/types.ts";
import { ESearchFeatureReturnKind } from "../../search/types.ts";

export async function resolveSearchInput(
    deps: {
        getBestSearchIndexEntry: TGetBestSearchIndexEntry;
        getEntityByKindAndId: TGetEntityByKindAndId;
    },
    input: string,
): Promise<TSearchFeatureReturn> {
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
