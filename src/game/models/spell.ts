import { defineEntity, p } from "@mikro-orm/sqlite";
import SpellRules from "../rules/spell.ts";
import { ESpellRole } from "../types.ts";
import type { ISpell } from "../types.ts";
import { DamageEffect } from "./damageEffect.ts";
import { Disciple } from "./disciple.ts";
import { HealEffect } from "./healEffect.ts";
import { MovementEffect } from "./movementEffect.ts";
import { MovementType } from "./movementType.ts";
import { ObstacleEffect } from "./obstacleEffect.ts";
import { SpellShape } from "./spellShape.ts";
import { StatusEffect } from "./statusEffect.ts";
import { SummonEffect } from "./summonEffect.ts";
import { TileEffect } from "./tileEffect.ts";
import { WarpEffect } from "./warpEffect.ts";
import { WeaponType } from "./weaponType.ts";

export const SpellSchema = defineEntity({
    name: "Spell",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        disciple: () => p.manyToOne(Disciple).inversedBy("spells").nullable(),
        role: p.enum([ESpellRole.EX, ESpellRole.LIGHT, ESpellRole.SHADOW]),
        shape: p.manyToOne(SpellShape),
        uses: p.integer().nullable(),
        cooldown: p.integer(),
        countdown: p.integer().nullable(),
        effects: () =>
            p
                .embedded([
                    DamageEffect,
                    HealEffect,
                    WarpEffect,
                    MovementEffect,
                    TileEffect,
                    ObstacleEffect,
                    SummonEffect,
                    StatusEffect,
                ])
                .array(),
        onlyFor: () =>
            p
                .manyToOne([MovementType, WeaponType])
                .discriminatorMap({
                    movementType: MovementType.name,
                    weaponType: WeaponType.name,
                })
                .nullable(),
    },
});

export class Spell extends SpellSchema.class implements ISpell {
    get kind() {
        return "spell" as const;
    }

    get draggingMode(): ISpell["draggingMode"] {
        return SpellRules.draggingModeKind(this);
    }
}
SpellSchema.setClass(Spell);
