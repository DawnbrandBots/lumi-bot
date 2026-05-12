import Fuse from "fuse.js";
import type { ISearchItem } from "../features/search.ts";
export interface ISearchEngine<Items extends ISearchItem> {
    searchOne(input: string): Items | undefined;
}

export abstract class SearchEngine<Items extends ISearchItem> implements ISearchEngine<Items> {
    abstract searchOne(input: string): Items | undefined;
}

export class FuseSearchEngine<Items extends ISearchItem> extends SearchEngine<Items> {
    private readonly fuse: Fuse<Items>;

    public constructor({ items }: { items: Items[] }) {
        super();
        const keys: (keyof Items & string)[] = ["name"];
        this.fuse = new Fuse(items, {
            keys,
            ignoreDiacritics: true,
            isCaseSensitive: false,
            useTokenSearch: true,
            ignoreLocation: true,
        });
    }

    public searchOne(input: string): Items | undefined {
        // TODO: this replace might be better called elsewhere?
        return this.fuse.search(input.replace("+", "Plus"), { limit: 1 })[0]?.item;
    }
}
