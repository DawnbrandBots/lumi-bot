import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellRole, type ISpell } from "../../../../../domain/game/models/spell.types.ts";
import { Disciple } from "./disciple.ts";
import { MovementType } from "./movementType.ts";
import { FormBasedSpellCast, NormalSpellCast } from "./spellCast.ts";
import { WeaponType } from "./weaponType.ts";

export const SpellSchema = defineEntity({
    name: "Spell",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        disciple: () => p.manyToOne(Disciple).inversedBy("spells").nullable(),
        role: p.enum(() => ESpellRole),
        uses: p.integer().nullable(),
        cast: () => p.embedded([NormalSpellCast, FormBasedSpellCast]).object(),
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
}
SpellSchema.setClass(Spell);
