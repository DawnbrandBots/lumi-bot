import type { TGetEntityByKindAndId } from "../game/feature.types.ts";
import type { TSearchOne } from "./feature.types.ts";
import type { TSearchFeatureReturn } from "./types.ts";
import { ESearchFeatureReturnKind } from "./types.ts";

export async function SearchFeature(
    deps: {
        searchOne: TSearchOne;
        getEntityByKindAndId: TGetEntityByKindAndId;
    },
    input: string,
): Promise<TSearchFeatureReturn> {
    const searchItem = await deps.searchOne(input);

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
