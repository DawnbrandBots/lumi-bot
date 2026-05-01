import Fuse from "fuse.js/basic";
import { TId } from "../types.ts";

export interface ISearchItem {
    readonly kind: string;
    readonly id: TId;
    readonly name: string;
}

export type _ISearchItem<Kind extends string> = ISearchItem & { kind: Kind }

export type SearchResult<Kind extends string> = { success: true, value: _ISearchItem<Kind> } | { success: false, msg: string };

export function createFuse<Kind extends string>({ items }: { items: _ISearchItem<Kind>[] }): Fuse<_ISearchItem<Kind>> {
    const keys: (keyof _ISearchItem<Kind>)[] = ["name"]
    return new Fuse(items, { keys, ignoreDiacritics: true, isCaseSensitive: false });
}

export function search<Kind extends string>({ fuse, search }: { fuse: Fuse<_ISearchItem<Kind>>, search: string }): SearchResult<Kind> {
    const results = fuse.search(search, { limit: 1 });
    const result = results[0];

    if (!result) {
        return {
            success: false,
            msg: "Search yielded no result.",
        }
    }
    return {
        success: true,
        value: result.item
    }
}
