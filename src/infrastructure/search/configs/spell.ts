import { Spell } from "../../game/models/spell.ts";
import type { ISearchConfig } from "../types.ts";

const populate = ["*"] as const;
const spellSearchConfig: ISearchConfig<Spell, (typeof populate)[number]> = {
    class: Spell,
    populate,
} as const;

export default spellSearchConfig;
