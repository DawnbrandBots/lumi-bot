import { APIEmbed } from "discord.js";
import { SearchHandler } from "../features/search.ts";
import { Spell } from "../models.ts";
import { ISpell } from "../types.ts";

const spellSearchHandler: SearchHandler<Spell> = {
    class: Spell,
    response: (spell: ISpell) => {
        const fields: APIEmbed["fields"] = [
            {
                name: "Effects",
                value: spell.effects.map(effect => `- ${effect.description}`).join("\n")
            }
        ]

        return {
            title: spell.name,
            fields
        }
    }
} as const

export default spellSearchHandler