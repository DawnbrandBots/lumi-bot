import type { TSearchEntity, TSearchIndexEntry, TSearchKind } from "../../domain/search/types.ts";
import type { MaybePromise } from "../../utils/types.ts";

export type TGetBestSearchIndexEntry = (input: string) => MaybePromise<TSearchIndexEntry | null>;
export type TGetSearchIndexEntries = (arg: { input: string; limit?: number }) => MaybePromise<TSearchIndexEntry[]>;
export type TGetEntityByKindAndId = <Kind extends TSearchKind>(arg: {
    kind: Kind;
    id: string;
}) => MaybePromise<TSearchEntity<Kind> | null>;

export type TSearchQueries = {
    getBestSearchIndexEntry: TGetBestSearchIndexEntry;
    getEntityByKindAndId: TGetEntityByKindAndId;
    getSearchIndexEntries: TGetSearchIndexEntries;
};

export default TSearchQueries;
