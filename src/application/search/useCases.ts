import { resolveSearchInput } from "./useCases/resolveSearchInput.ts";
import { suggestSearchResults } from "./useCases/suggestSearchResults.ts";
export type { TSearchUseCases } from "./useCases.types.ts";

export const SEARCH_USE_CASES = {
    resolveSearchInput,
    suggestSearchResults,
};

export default SEARCH_USE_CASES;
