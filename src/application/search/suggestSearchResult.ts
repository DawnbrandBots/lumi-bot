import type { TGetSearchIndexEntries } from "./ports.ts";

export async function suggestSearchResult(
    getSearchIndexEntries: TGetSearchIndexEntries,
    { input, limit }: { input: string; limit?: number },
) {
    return await getSearchIndexEntries({ input, limit });
}
