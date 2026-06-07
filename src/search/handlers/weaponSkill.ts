import { WeaponSkill } from "../../game/models/weaponSkill.ts";
import type { ISearchConfig } from "../types.ts";

const weaponSkillSearchConfig: ISearchConfig<WeaponSkill> = {
    class: WeaponSkill,
} as const;

export default weaponSkillSearchConfig;
