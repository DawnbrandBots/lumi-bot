import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISummonEffect } from "../types.ts";
import { MovementType } from "./movementType.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SummonEffectStat } from "./summonEffectStat.ts";
import { WeaponType } from "./weaponType.ts";

export const SummonEffectSchema = defineEntity({
    name: "SummonEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "SUMMON",
    properties: {
        kind: p.enum(["SUMMON"]),
        movementType: () => p.manyToOne(MovementType),
        weaponType: () => p.manyToOne(WeaponType),
        hp: () => p.embedded(SummonEffectStat).object(),
        atk: () => p.embedded(SummonEffectStat).object(),
    },
});

export class SummonEffect extends SummonEffectSchema.class implements ISummonEffect {}
SummonEffectSchema.setClass(SummonEffect);
