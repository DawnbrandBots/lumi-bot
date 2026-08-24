import type { TSearchUseCaseDependencies, TSearchUseCases } from "../useCases.types.ts";

export default function suggestSearchResults(
    dependencies: TSearchUseCaseDependencies,
    { input, limit }: Parameters<TSearchUseCases["suggestSearchResults"]>[0],
): ReturnType<TSearchUseCaseDependencies["persistence"]["getSearchIndexEntries"]> {
    return dependencies.persistence.getSearchIndexEntries({ input, limit });
}
