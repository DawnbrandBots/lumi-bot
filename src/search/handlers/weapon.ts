import { Weapon } from "../../game/models/weapon.ts";
import type { ISearchConfig } from "../types.ts";

const populate = ["weaponType", "weaponType.weaponSkills.effect", "uniqueSkill.effect", "prfDisciple"] as const;
const weaponSearchConfig: ISearchConfig<Weapon, (typeof populate)[number]> = {
    class: Weapon,
    populate: populate,
} as const;

export default weaponSearchConfig;
