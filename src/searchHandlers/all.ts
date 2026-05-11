import discipleSearchHandler from "./disciple.ts";
import spellSearchHandler from "./spell.ts";
import weaponSearchHandler from "./weapon.ts";
import weaponSkillSearchHandler from "./weaponSkill.ts";

const SEARCH_HANDLERS = {
    disciple: discipleSearchHandler,
    weapon: weaponSearchHandler,
    weaponSkill: weaponSkillSearchHandler,
    spell: spellSearchHandler,
} as const;

export default SEARCH_HANDLERS;
