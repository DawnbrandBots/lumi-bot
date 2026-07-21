import { distance } from "fastest-levenshtein";
import Fuse, { type FuseSortFunctionArg } from "fuse.js";
import removeDiacritics from "../utils/removeDiacritics.ts";
import type { ISearchEngine, ISearchItem } from "./types.ts";

/** Alias match type provided by Fuse to custom sort functions. */
type TAliasMatch = NonNullable<FuseSortFunctionArg["matches"]>[number];

/** Gets the best individual alias match from a Fuse result before Fuse combines scores for the item. */
function getBestAlias(result: FuseSortFunctionArg): TAliasMatch | null {
    return (
        result.matches?.reduce<TAliasMatch | null>(
            (bestAlias, alias) => (bestAlias && bestAlias.score <= alias.score ? bestAlias : alias),
            null,
        ) ?? null
    );
}

function getAliasDistanceToInput({ alias, input }: { alias: TAliasMatch | null; input: string }): number {
    return alias ? distance(removeDiacritics(alias.value), removeDiacritics(input)) : Number.POSITIVE_INFINITY;
}

export abstract class SearchEngine<Items extends ISearchItem> implements ISearchEngine<Items> {
    abstract searchOne(input: string): Items | undefined;
    abstract search(input: string, limit?: number): Items[];
}

export class FuseSearchEngine<Items extends ISearchItem> extends SearchEngine<Items> {
    private readonly fuse: Fuse<Items>;

    private lastInput: string = "";

    public constructor({ items }: { items: Items[] }) {
        super();
        const keys: (keyof Items & string)[] = ["aliases"];
        this.fuse = new Fuse(items, {
            keys,
            ignoreDiacritics: true,
            isCaseSensitive: false,
            useTokenSearch: true,
            ignoreLocation: true,
            sortFn: (a, b) => this.sortByBestAliasScore(a, b),
        });
    }

    protected sortByBestAliasScore(a: FuseSortFunctionArg, b: FuseSortFunctionArg): number {
        const aBestAlias = getBestAlias(a);
        const bBestAlias = getBestAlias(b);
        return (
            (aBestAlias?.score ?? 1) - (bBestAlias?.score ?? 1) ||
            getAliasDistanceToInput({ alias: aBestAlias, input: this.lastInput }) -
                getAliasDistanceToInput({ alias: bBestAlias, input: this.lastInput }) ||
            a.idx - b.idx
        );
    }

    public search(input: string, limit?: number): Items[] {
        if (input.length === 0) {
            return [];
        }
        this.lastInput = input;
        return this.fuse.search(this.lastInput, { limit }).map((result) => result.item);
    }

    public searchOne(input: string): Items | undefined {
        return this.search(input, 1)[0];
    }
}
