import { defineEntity, p } from "@mikro-orm/core";
import type { ISummonEffect } from "../types.ts";
import { MovementType } from "./movementType.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SummonEffectStat } from "./summonEffectStat.ts";
import { WeaponType } from "./weaponType.ts";

export const SummonEffectSchema = defineEntity({
    name: 'SummonEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "SUMMON",
    properties: {
        kind: p.enum(["SUMMON"]),
        movementType: () => p.manyToOne(MovementType),
        weaponType: () => p.manyToOne(WeaponType),
        hp: () => p.embedded(SummonEffectStat).object(),
        atk: () => p.embedded(SummonEffectStat).object()
    },
})

export class SummonEffect extends SummonEffectSchema.class implements ISummonEffect {

    public get description() {
        // TODO: technically should use HP and Atk entities names, but that's something more advanced to handle later...
        return `Summons ${this.weaponType.name} ${this.movementType.name} minion with ${this.hp.base} HP and ${this.atk.base} Atk`
    }
}
SummonEffectSchema.setClass(SummonEffect);
