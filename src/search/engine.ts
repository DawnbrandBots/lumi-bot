import { distance } from "fastest-levenshtein";
import Fuse, { type FuseSortFunctionArg } from "fuse.js";
import removeDiacritics from "../utils/removeDiacritics.ts";
import type { ISearchEngine, ISearchItem } from "./types.ts";

/** Alias match type provided by Fuse to custom sort functions. */
type TAliasMatch = NonNullable<FuseSortFunctionArg["matches"]>[number];

/**
 * Returns the alias with the best score in the given ${@link FuseSortFunctionArg}.
 *
 * As an example, the fuse item for the "Ennea Fire EX" spell can have the "Ennea Fire EX", "EFEX" and "Kurt's EX" aliases.
 * Given "Kurt" as input, "Kurt's EX" is the alias that's the closest, and therefore its score is the best.
 * The fuse match for "Kurt's EX" in the "Ennea Fire EX" fuse item will be returned.
 */
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
    /** Used in the custom fuse sorting function. `sortFn` does not receive the search input as argument. */
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

    /**
     * By default, fuse scores items and sorts them by their score, best first.
     * When items have multiple aliases, an item's score appears to be the result of a certain operation on all of its aliases' score (most likely multiplication).
     * This may cause unwanted results to receive a better score.
     *
     * For example, if the "Royal Sword +" fuse item has aliases "Royal Sword +", "Royal Sword Plus" and "Kurt's Weapon",
     * and the "Royal Scion" fuse item has aliases "Royal Scion", "Royal Sword +'s weapon skill" and "Royal Sword + weapon skill",
     * If given "Royal Sword" as input, with the default sorting, "Royal Scion" will appear first:
     * "Royal Sword" matches two aliases in each item, but "Royal" also partially matches "Royal Scion", but not "Kurt's Weapon".
     *
     * This sorting method instead uses each item's best matching alias' score for comparison.
     * In case of equality, then the item's levenshtein distance relative to the input is used for comparison.
     *
     * Fuse gives the same score of 0.01 to "Royal Sword's skill" and "Royal Sword" when given "Royal Sword" as input.
     * The Levenshtein distance breaks the tie by prioritizing the item which is actually closest to the input.
     */
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
