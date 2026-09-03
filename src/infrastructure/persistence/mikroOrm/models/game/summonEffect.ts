import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISummonEffect } from "../../../../../domain/game/models/spellEffect.types.ts";
import { ESpellEffectKind } from "../../../../../domain/game/models/spellEffect.types.ts";
import { MovementType } from "./movementType.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SummonEffectStatValue } from "./summonEffectStat.ts";
import { WeaponType } from "./weaponType.ts";

export const SummonEffectSchema = defineEntity({
    name: "SummonEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.SUMMON,
    properties: {
        kind: p.enum([ESpellEffectKind.SUMMON]),
        movementType: () => p.manyToOne(MovementType),
        weaponType: () => p.manyToOne(WeaponType),
        hp: () => p.embedded(SummonEffectStatValue).object(),
        atk: () => p.embedded(SummonEffectStatValue).object(),
    },
});

export class SummonEffect extends SummonEffectSchema.class implements ISummonEffect {}
SummonEffectSchema.setClass(SummonEffect);
