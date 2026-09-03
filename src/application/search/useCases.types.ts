import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import type { MaybePromise } from "../../utils/types.ts";
import type { TSearchResult } from "./types.ts";

export type TSearchUseCaseArgs = {
    readonly resolveSearchInput: string;
    readonly suggestSearchResults: {
        readonly input: string;
        readonly limit?: number;
    };
};

export type TSearchUseCases = {
    readonly resolveSearchInput: (arg: TSearchUseCaseArgs["resolveSearchInput"]) => Promise<TSearchResult>;
    readonly suggestSearchResults: (
        arg: TSearchUseCaseArgs["suggestSearchResults"],
    ) => MaybePromise<readonly TSearchIndexEntry[]>;
};
export default TSearchUseCases;
