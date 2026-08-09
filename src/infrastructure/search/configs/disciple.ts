import { Disciple } from "../../game/models/disciple.ts";
import type { ISearchConfig } from "../types.ts";

const discipleSearchConfig: ISearchConfig<Disciple> = {
    class: Disciple,
} as const;

export default discipleSearchConfig;
