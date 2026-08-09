import { WeaponSkill } from "../../infrastructure/game/models/weaponSkill.ts";
import type { ISearchConfig } from "../../infrastructure/search/types.ts";

const weaponSkillSearchConfig: ISearchConfig<WeaponSkill> = {
    class: WeaponSkill,
} as const;

export default weaponSkillSearchConfig;
