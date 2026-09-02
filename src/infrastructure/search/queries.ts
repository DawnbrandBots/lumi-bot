import { getBestSearchIndexEntry } from "./queries/getBestSearchIndexEntry.ts";
import { getSearchIndexEntries } from "./queries/getSearchIndexEntries.ts";

export const QUERIES = {
    getBestSearchIndexEntry,
    getSearchIndexEntries,
} as const;
