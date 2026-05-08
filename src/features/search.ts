import Fuse from "fuse.js/basic";

import { EntityManager, EntityName } from "@mikro-orm/sqlite";
import { TId } from "../types.ts";

export interface ISearchItem {
    readonly kind: string;
    readonly id: TId;
    readonly name: string;
}

export function createFuse<Items extends ISearchItem>({ items }: { items: Items[] }): Fuse<Items> {
    const keys: (keyof Items & string)[] = ["name"]
    return new Fuse(items, { keys, ignoreDiacritics: true, isCaseSensitive: false });
}

export type SearchHandler<EntityType extends ISearchItem> = {
    class: EntityName<EntityType>,
    response: (item: EntityType) => string
}

export type SearchHandlers<Items extends ISearchItem> = {
    [Kind in Items["kind"]]: SearchHandler<Items & { kind: Kind }>
}

async function searchFeature<
    Items extends ISearchItem & { kind: Kinds },
    // TODO: I am not sure why result.item.kind cannot index handlers without specifying this second type argument
    Kinds extends ISearchItem["kind"] = ISearchItem["kind"]
>({
    input,
    fuse,
    handlers,
    em
}: {
    input: string,
    fuse: Fuse<Items>,
    handlers: SearchHandlers<Items>,
    em: EntityManager
}): Promise<string> {
    const results = fuse.search(input, { limit: 1 });
    const result = results[0];

    if (!result) {
        return "Search yielded no result."
    }

    const handler = handlers[result.item.kind]

    // TODO: figure out the correct types here and remove as never
    const entity = await em.findOne(handler.class, { id: result.item.id } as never, { populate: ["*"] } as never)
    if (!entity) {
        throw new Error(`Entity of kind ${result.item.kind} id ${result.item.id} not found.`)
    }
    const response = handler.response(entity)
    return response
}

export default searchFeature