import { Disciple } from "../../infrastructure/game/models/disciple.ts";
import type { ISearchConfig } from "../../infrastructure/search/types.ts";

const discipleSearchConfig: ISearchConfig<Disciple> = {
    class: Disciple,
} as const;

export default discipleSearchConfig;
