import type { MaybePromise } from "../../utils/types.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";

export type TSuggestSearchResults = (arg: {
    readonly input: string;
    readonly limit?: number;
}) => MaybePromise<readonly TSearchIndexEntry[]>;
