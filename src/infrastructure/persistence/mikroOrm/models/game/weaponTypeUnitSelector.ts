import { defineEntity, p } from "@mikro-orm/sqlite";
import { EUnitSelectorProperty, type TUnitSelector } from "../../../../../domain/game/models/unitSelector.types.ts";
import { UnitSelector } from "./unitSelector.ts";
import { WeaponType } from "./weaponType.ts";

type TWeaponTypeUnitSelector = Extract<TUnitSelector, { property: typeof EUnitSelectorProperty.WEAPON_TYPE }>;

export const WeaponTypeUnitSelectorSchema = defineEntity({
    name: "WeaponTypeUnitSelector",
    embeddable: true,
    extends: UnitSelector,
    discriminatorValue: EUnitSelectorProperty.WEAPON_TYPE,
    properties: {
        property: p.enum([EUnitSelectorProperty.WEAPON_TYPE]),
        weaponType: () => p.manyToOne(WeaponType),
    },
});

export class WeaponTypeUnitSelector extends WeaponTypeUnitSelectorSchema.class implements TWeaponTypeUnitSelector {
    get value(): TWeaponTypeUnitSelector["value"] {
        return this.weaponType;
    }
}
WeaponTypeUnitSelectorSchema.setClass(WeaponTypeUnitSelector);
