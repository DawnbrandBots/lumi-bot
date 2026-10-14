import { defineEntity, p } from "@mikro-orm/sqlite";
import { EUnitRole } from "../../../../../domain/game/models/unit.types.ts";
import { EUnitSelectorProperty, type TUnitSelector } from "../../../../../domain/game/models/unitSelector.types.ts";
import { UnitSelector } from "./unitSelector.ts";

type TUnitRoleSelector = Extract<TUnitSelector, { property: typeof EUnitSelectorProperty.ROLE }>;

export const UnitRoleSelectorSchema = defineEntity({
    name: "UnitRoleSelector",
    embeddable: true,
    extends: UnitSelector,
    discriminatorValue: EUnitSelectorProperty.ROLE,
    properties: {
        property: p.enum([EUnitSelectorProperty.ROLE]),
        unitRole: p.enum(() => EUnitRole),
    },
});

export class UnitRoleSelector extends UnitRoleSelectorSchema.class implements TUnitRoleSelector {
    get value(): TUnitRoleSelector["value"] {
        return this.unitRole;
    }
}
UnitRoleSelectorSchema.setClass(UnitRoleSelector);
