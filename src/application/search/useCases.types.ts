import type { MaybePromise } from "../../utils/types.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import type { TSearchPersistence } from "./persistence.types.ts";
import type { TSearchResult } from "./types.ts";

export type TSearchUseCaseDependencies = {
    readonly persistence: TSearchPersistence;
};

export type TResolveSearchInput = (input: string) => Promise<TSearchResult>;
export type TSuggestSearchResults = (arg: {
    readonly input: string;
    readonly limit?: number;
}) => MaybePromise<readonly TSearchIndexEntry[]>;

export type TSearchUseCases = {
    readonly resolveSearchInput: TResolveSearchInput;
    readonly suggestSearchResults: TSuggestSearchResults;
};
export default TSearchUseCases;
