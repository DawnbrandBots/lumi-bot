import type { TSearchUseCaseDependencies, TSuggestSearchResults } from "../useCases.types.ts";

export default function suggestSearchResults(
    dependencies: TSearchUseCaseDependencies,
    { input, limit }: Parameters<TSuggestSearchResults>[0],
): ReturnType<TSearchUseCaseDependencies["persistence"]["getSearchIndexEntries"]> {
    return dependencies.persistence.getSearchIndexEntries({ input, limit });
}
