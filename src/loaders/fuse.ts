import Fuse from "fuse.js";
import { ISearchItem } from "../features/search.ts";

export function getFuse<Items extends ISearchItem>({ items }: { items: Items[] }): Fuse<Items> {
    const keys: (keyof Items & string)[] = ["name"];
    return new Fuse(items, { keys, ignoreDiacritics: true, isCaseSensitive: false });
}
