import { MovementTypeUnitSelector } from "./movementTypeUnitSelector.ts";
import { UnitKindSelector } from "./unitKindSelector.ts";
import { UnitRoleSelector } from "./unitRoleSelector.ts";
import { WeaponRangeUnitSelector } from "./weaponRangeUnitSelector.ts";
import { WeaponTypeUnitSelector } from "./weaponTypeUnitSelector.ts";

export const UNIT_SELECTORS = [
    UnitKindSelector,
    UnitRoleSelector,
    MovementTypeUnitSelector,
    WeaponTypeUnitSelector,
    WeaponRangeUnitSelector,
];
