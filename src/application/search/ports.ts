import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import type { MaybePromise } from "../../utils/types.ts";

export type TGetBestSearchIndexEntry = (input: string) => MaybePromise<TSearchIndexEntry | null>;
export type TGetSearchIndexEntries = (arg: { input: string; limit?: number }) => MaybePromise<TSearchIndexEntry[]>;
