import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISpellEffectValueEffectivenessItem } from "../../../../../domain/game/models/spellEffectValue.types.ts";
import { ESpellEffectScalingStrategy } from "../../../../../domain/game/models/spellEffectValue.types.ts";
import { MovementTypeUnitSelector } from "./movementTypeUnitSelector.ts";
import { UnitKindSelector } from "./unitKindSelector.ts";
import { UnitRoleSelector } from "./unitRoleSelector.ts";
import { WeaponRangeUnitSelector } from "./weaponRangeUnitSelector.ts";
import { WeaponTypeUnitSelector } from "./weaponTypeUnitSelector.ts";

export const SpellEffectValueEffectivenessItemSchema = defineEntity({
    name: "SpellEffectValueEffectivenessItem",
    embeddable: true,
    properties: {
        appliesTo: () =>
            p
                .embedded([
                    UnitKindSelector,
                    UnitRoleSelector,
                    MovementTypeUnitSelector,
                    WeaponTypeUnitSelector,
                    WeaponRangeUnitSelector,
                ])
                .object(),
        base: p.integer(),
        scalingStrategyOverride: p.enum(() => ESpellEffectScalingStrategy).nullable(),
    },
});
export class SpellEffectValueEffectivenessItem
    extends SpellEffectValueEffectivenessItemSchema.class
    implements ISpellEffectValueEffectivenessItem {}
SpellEffectValueEffectivenessItemSchema.setClass(SpellEffectValueEffectivenessItem);
