import type { MaybePromise } from "../../utils/types.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import type { TApplicationPersistence } from "../persistence.types.ts";
import type { TSearchResult } from "./types.ts";

export type TSearchUseCaseDependencies = {
    readonly persistence: TApplicationPersistence;
};

export type TSearchUseCases = {
    readonly resolveSearchInput: (input: string) => Promise<TSearchResult>;
    readonly suggestSearchResults: (arg: {
        readonly input: string;
        readonly limit?: number;
    }) => MaybePromise<readonly TSearchIndexEntry[]>;
};
export default TSearchUseCases;
