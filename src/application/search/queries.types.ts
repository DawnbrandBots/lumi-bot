import type { TSearchableEntity, TSearchIndexEntry, TSearchKind } from "../../domain/search/types.ts";
import type { MaybePromise } from "../../utils/types.ts";

export type TSearchQueries = {
    getBestSearchIndexEntry: (input: string) => MaybePromise<TSearchIndexEntry | null>;
    getEntityByKindAndId: (arg: { kind: TSearchKind; id: string }) => MaybePromise<TSearchableEntity | null>;
    getSearchIndexEntries: (arg: { input: string; limit?: number }) => MaybePromise<TSearchIndexEntry[]>;
};

export default TSearchQueries;
