import type { TSearchUseCaseDependencies, TSearchUseCases } from "../useCases.types.ts";

export default function suggestSearchResults(
    dependencies: TSearchUseCaseDependencies,
    { input, limit }: Parameters<TSearchUseCases["suggestSearchResults"]>[0],
): ReturnType<TSearchUseCaseDependencies["persistence"]["search"]["getSearchIndexEntries"]> {
    return dependencies.persistence.search.getSearchIndexEntries({ input, limit });
}
