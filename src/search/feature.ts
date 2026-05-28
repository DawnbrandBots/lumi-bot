import type { EntityManager } from "@mikro-orm/sqlite";
import { SEARCH_MAX_INPUT_LENGTH } from "../bot/constants.ts";
import type { ISearchableEntity, ISearchEngine, ISearchHandlers, ISearchItem } from "./types.ts";
import { SearchFeatureReturnKind } from "./types.ts";

async function searchFeature<
    Items extends ISearchableEntity & { kind: Kinds },
    Kinds extends ISearchableEntity["kind"] = Items["kind"],
>({
    input,
    searchEngine,
    handlers,
    em,
}: {
    input: string;
    searchEngine: ISearchEngine<ISearchItem & { kind: Kinds }>;
    handlers: ISearchHandlers<Items>;
    em: EntityManager;
}) {
    if (input.length > SEARCH_MAX_INPUT_LENGTH) {
        return { kind: SearchFeatureReturnKind.INPUT_TOO_LONG, unexpected: false } as const;
    }

    const searchItem = searchEngine.searchOne(input);

    if (!searchItem) {
        return { kind: SearchFeatureReturnKind.NO_RESULT, unexpected: false } as const;
    }

    const handler = handlers[searchItem.kind];

    // TODO: figure out the correct types here and remove as never
    const entity = await em.findOne(handler.class, { id: searchItem.id } as never, {
        populate: (handler.populate ?? ["*"]) as never,
    });
    if (!entity) {
        return {
            kind: SearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,
            unexpected: true,
            value: { kind: searchItem.kind, id: searchItem.id },
        } as const;
    }

    return {
        kind: SearchFeatureReturnKind.SUCCESS,
        unexpected: false,
        value: { entity, searchItem },
    } as const;
}

export default searchFeature;
