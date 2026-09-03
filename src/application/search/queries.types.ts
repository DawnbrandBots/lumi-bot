import type { TSearchableEntity, TSearchIndexEntry, TSearchKind } from "../../domain/search/types.ts";
import type { MaybePromise } from "../../utils/types.ts";

export type TGetBestSearchIndexEntry = (input: string) => MaybePromise<TSearchIndexEntry | null>;
export type TGetSearchIndexEntries = (arg: { input: string; limit?: number }) => MaybePromise<TSearchIndexEntry[]>;
export type TGetEntityByKindAndId = (arg: { kind: TSearchKind; id: string }) => MaybePromise<TSearchableEntity | null>;

export type TSearchQueries = {
    getBestSearchIndexEntry: TGetBestSearchIndexEntry;
    getEntityByKindAndId: TGetEntityByKindAndId;
    getSearchIndexEntries: TGetSearchIndexEntries;
};

export default TSearchQueries;
