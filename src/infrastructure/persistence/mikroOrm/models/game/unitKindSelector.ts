import { defineEntity, p } from "@mikro-orm/sqlite";
import { EUnitKind } from "../../../../../domain/game/models/unit.types.ts";
import { EUnitSelectorProperty, type TUnitSelector } from "../../../../../domain/game/models/unitSelector.types.ts";
import { UnitSelector } from "./unitSelector.ts";

type TUnitKindSelector = Extract<TUnitSelector, { property: typeof EUnitSelectorProperty.KIND }>;

export const UnitKindSelectorSchema = defineEntity({
    name: "UnitKindSelector",
    embeddable: true,
    extends: UnitSelector,
    discriminatorValue: EUnitSelectorProperty.KIND,
    properties: {
        property: p.enum([EUnitSelectorProperty.KIND]),
        unitKind: p.enum(() => EUnitKind),
    },
});

export class UnitKindSelector extends UnitKindSelectorSchema.class implements TUnitKindSelector {
    get value(): TUnitKindSelector["value"] {
        return this.unitKind;
    }
}
UnitKindSelectorSchema.setClass(UnitKindSelector);
