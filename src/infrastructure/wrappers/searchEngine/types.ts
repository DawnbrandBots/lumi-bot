import type { ISearchIndexEntry } from "../../../domain/search/types.ts";

/** Handles user text searches. */
export interface ISearchEngine<Items extends ISearchIndexEntry> {
    /** May return a searchable item when provided with user input. */
    searchOne(userInput: string): Items | null;
    /** Returns an array of searchable items matching the user input. */
    search(userInput: string, limit?: number): Items[];
}
