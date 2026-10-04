import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISpell } from "../../../../../domain/game/models/spell.types.ts";
import { ESpellRole } from "../../../../../domain/game/models/spell.types.ts";
import SpellRules from "../../../../../domain/game/rules/spell.ts";
import { Disciple } from "./disciple.ts";
import { MovementType } from "./movementType.ts";
import { FormBasedSpellEffects, NormalSpellEffects } from "./spellEffects.ts";
import { SpellShape } from "./spellShape.ts";
import { WeaponType } from "./weaponType.ts";

export const SpellSchema = defineEntity({
    name: "Spell",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        disciple: () => p.manyToOne(Disciple).inversedBy("spells").nullable(),
        role: p.enum(() => ESpellRole),
        shape: p.manyToOne(SpellShape),
        uses: p.integer().nullable(),
        cooldown: p.integer(),
        countdown: p.integer().nullable(),
        effects: () => p.embedded([NormalSpellEffects, FormBasedSpellEffects]).object(),
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
