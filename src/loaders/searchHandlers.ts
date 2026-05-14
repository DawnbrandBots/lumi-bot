import discipleSearchHandler from "../search/handlers/disciple.ts";
import spellSearchHandler from "../search/handlers/spell.ts";
import weaponSearchHandler from "../search/handlers/weapon.ts";
import weaponSkillSearchHandler from "../search/handlers/weaponSkill.ts";

const SEARCH_HANDLERS = {
    disciple: discipleSearchHandler,
    weapon: weaponSearchHandler,
    weaponSkill: weaponSkillSearchHandler,
    spell: spellSearchHandler,
} as const;

export default SEARCH_HANDLERS;
