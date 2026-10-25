import type { TBazaarQueries } from "./bazaar/queries.types.ts";
import type { TSearchQueries } from "./search/queries.types.ts";

export type TApplicationQueries = {
    readonly bazaar: TBazaarQueries;
    readonly search: TSearchQueries;
};
