import type { EntityManager } from "@mikro-orm/sqlite";
import { SEARCH_MAX_INPUT_LENGTH } from "../bot/constants.ts";
import type { ISearchableEntity, ISearchConfigs, ISearchEngine, ISearchItem } from "./types.ts";
import { ESearchFeatureReturnKind } from "./types.ts";

async function searchFeature<
    Items extends ISearchableEntity & { kind: Kinds },
    Kinds extends ISearchableEntity["kind"] = Items["kind"],
>({
    input,
    searchEngine,
    configs,
    em,
}: {
    input: string;
    searchEngine: ISearchEngine<ISearchItem & { kind: Kinds }>;
    configs: ISearchConfigs<Items>;
    em: EntityManager;
}) {
    if (input.length > SEARCH_MAX_INPUT_LENGTH) {
        return { kind: ESearchFeatureReturnKind.INPUT_TOO_LONG } as const;
    }

    const searchItem = searchEngine.searchOne(input);

    if (!searchItem) {
        return { kind: ESearchFeatureReturnKind.NO_RESULT } as const;
    }

    const config = configs[searchItem.kind];

    // TODO: figure out the correct types here and remove as never
    const entity = await em.findOne(config.class, { id: searchItem.id } as never, {
        populate: (config.populate ?? ["*"]) as never,
    });
    if (!entity) {
        return {
            kind: ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,
            value: { kind: searchItem.kind, id: searchItem.id },
        } as const;
    }

    return {
        kind: ESearchFeatureReturnKind.SUCCESS,
        value: { entity, searchItem },
    } as const;
}

export default searchFeature;
