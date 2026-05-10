import { defineEntity, p } from "@mikro-orm/core";
import type { ISpell } from "../types.ts";
import { DamageEffect } from "./damageEffect.ts";
import { Disciple } from "./disciple.ts";
import { HealEffect } from "./healEffect.ts";
import { IceBlockEffect } from "./iceBlockEffect.ts";
import { MovementEffect } from "./movementEffect.ts";
import { SPELL_DRAGGING_MODE } from "./spellDraggingMode.ts";
import { SpellRoleType } from "./spellRole.ts";
import { SpellShape } from "./spellShape.ts";
import { StatusEffect } from "./statusEffect.ts";
import { SummonEffect } from "./summonEffect.ts";
import { TileEffect } from "./tileEffect.ts";
import { WarpEffect } from "./warpEffect.ts";

export const SpellSchema = defineEntity({
    name: 'Spell',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        disciple: () => p.manyToOne(Disciple).inversedBy("spells"),
        role: p.type(SpellRoleType),
        shape: p.manyToOne(SpellShape),
        uses: p.integer().nullable(),
        cooldown: p.integer(),
        effects: () => p.embedded([DamageEffect, HealEffect, WarpEffect, MovementEffect, TileEffect, IceBlockEffect, SummonEffect, StatusEffect]).array(),
        // TODO: onlyFor will get a proper type in a later update. Right now it has the same issues as TileEffect when using polymorphic relationships
        // as type for the "which" nested property, which can reference either MovementType or WeaponType
        onlyFor: p.json<{ kind: string, which: string }>().nullable()
    },
})

export class Spell extends SpellSchema.class implements ISpell {
    get kind() { return "spell" as const }

    get draggingMode() {
        // TODO: target being nullable is due to some spell effects being wrongly typed:
        // damage and healing effects can be nested, in which case they don't have a target,
        // but they always have a target at the root as effects at the rool level of Spell.effects
        // This needs to be fixed eventually!!
        return this.effects.every(effect => effect.target!.kind === "SELF") ? SPELL_DRAGGING_MODE.SELF : SPELL_DRAGGING_MODE.ANY
    }
}
SpellSchema.setClass(Spell);
