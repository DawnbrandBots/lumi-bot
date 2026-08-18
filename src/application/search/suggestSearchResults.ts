import type { TGetSearchIndexEntries } from "./ports.ts";
import type { TSuggestSearchResults } from "./suggestSearchResults.types.ts";

export function suggestSearchResults(
    getSearchIndexEntries: TGetSearchIndexEntries,
    { input, limit }: Parameters<TSuggestSearchResults>[0],
): ReturnType<TGetSearchIndexEntries> {
    return getSearchIndexEntries({ input, limit });
}
