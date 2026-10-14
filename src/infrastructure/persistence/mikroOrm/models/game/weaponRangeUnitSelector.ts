import { defineEntity, p } from "@mikro-orm/sqlite";
import { EUnitSelectorProperty, type TUnitSelector } from "../../../../../domain/game/models/unitSelector.types.ts";
import { UnitSelector } from "./unitSelector.ts";

type TWeaponRangeUnitSelector = Extract<TUnitSelector, { property: typeof EUnitSelectorProperty.WEAPON_RANGE }>;

export const WeaponRangeUnitSelectorSchema = defineEntity({
    name: "WeaponRangeUnitSelector",
    embeddable: true,
    extends: UnitSelector,
    discriminatorValue: EUnitSelectorProperty.WEAPON_RANGE,
    properties: {
        property: p.enum([EUnitSelectorProperty.WEAPON_RANGE]),
        range: p.enum([1, 2]),
    },
});

export class WeaponRangeUnitSelector extends WeaponRangeUnitSelectorSchema.class implements TWeaponRangeUnitSelector {
    get value(): TWeaponRangeUnitSelector["value"] {
        return this.range;
    }
}
WeaponRangeUnitSelectorSchema.setClass(WeaponRangeUnitSelector);
