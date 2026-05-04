import { Spell } from "../models.ts";
import { ISpell } from "../types.ts";

const spellSearchHandler = {
    class: Spell,
    response: (spell: ISpell) => {
        return `**${spell.name}**:\n${spell.description}`
    }
} as const

export default spellSearchHandler