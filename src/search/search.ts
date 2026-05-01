import Fuse from "fuse.js/basic";
import { IDisciple, IWeapon } from "../types.js";

export type SearchIndex = Record<string, IWeapon>;
export type SearchItem = IWeapon | IDisciple;
export type SearchItems = SearchItem[];
export type SearchResult = { success: true, value: SearchItem } | { success: false, msg: string };

export function createFuse({ items }: { items: SearchItems }): Fuse<SearchItem> {
    return new Fuse(items, { keys: ["name"], ignoreDiacritics: true, isCaseSensitive: false });
}

export function search({ fuse, search }: { fuse: Fuse<SearchItem>, search: string }): SearchResult {
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
