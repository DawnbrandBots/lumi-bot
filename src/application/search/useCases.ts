import resolveSearchInput from "./useCases/resolveSearchInput.ts";
import suggestSearchResults from "./useCases/suggestSearchResults.ts";
export type { TSearchUseCases } from "./useCases.types.ts";

const USE_CASES = {
    resolveSearchInput,
    suggestSearchResults,
};

export default USE_CASES;
