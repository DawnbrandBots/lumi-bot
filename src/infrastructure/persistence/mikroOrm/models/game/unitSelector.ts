import { defineEntity, p } from "@mikro-orm/sqlite";
import { EUnitSelectorProperty } from "../../../../../domain/game/models/unitSelector.types.ts";

export const UnitSelectorSchema = defineEntity({
    name: "UnitSelector",
    embeddable: true,
    abstract: true,
    discriminatorColumn: "property",
    properties: {
        property: p.enum(() => EUnitSelectorProperty),
    },
});

export abstract class UnitSelector extends UnitSelectorSchema.class {}
UnitSelectorSchema.setClass(UnitSelector);
