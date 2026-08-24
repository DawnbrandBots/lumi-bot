import type { TSearchPersistence } from "../persistence.types.ts";
import type { TSuggestSearchResults } from "../useCases.types.ts";

export default function suggestSearchResults(
    deps: Pick<TSearchPersistence, "getSearchIndexEntries">,
    { input, limit }: Parameters<TSuggestSearchResults>[0],
): ReturnType<TSearchPersistence["getSearchIndexEntries"]> {
    return deps.getSearchIndexEntries({ input, limit });
}
