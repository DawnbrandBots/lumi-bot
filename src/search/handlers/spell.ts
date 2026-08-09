import { Spell } from "../../infrastructure/game/models/spell.ts";
import type { ISearchConfig } from "../../infrastructure/search/types.ts";

const populate = ["*"] as const;
const spellSearchConfig: ISearchConfig<Spell, (typeof populate)[number]> = {
    class: Spell,
    populate,
} as const;

export default spellSearchConfig;
