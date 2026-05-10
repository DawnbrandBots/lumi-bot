import { APIEmbed } from "discord.js";
import { DISCORD_BLACK_SQUARE_EMOJI_CALL, DISCORD_BLUE_SQUARE_EMOJI_CALL, DISCORD_RED_SQUARE_EMOJI_CALL } from "../constants.ts";
import { SearchHandler } from "../features/search.ts";
import { Spell } from "../models.ts";
import { ISpell } from "../types.ts";

const tileEmojis: Record<string, string> = {
    "X": DISCORD_RED_SQUARE_EMOJI_CALL,
    "O": DISCORD_BLUE_SQUARE_EMOJI_CALL,
    ".": DISCORD_BLACK_SQUARE_EMOJI_CALL,
}

const spellSearchHandler: SearchHandler<Spell> = {
    class: Spell,
    response: (spell: ISpell) => {
        const shapeEmojis = spell.shape.tiles
            .replaceAll(/(.{5})(?<!$)/g, "$1\n")
            .replaceAll(/./g, tile => tileEmojis[tile] ?? tile)
        const shapeStr = `${shapeEmojis}\n-# "${spell.shape.name}"`

        const fields: APIEmbed["fields"] = [
            {
                name: "Disciple",
                value: spell.disciple.name,
                inline: true
            },
            {
                name: "Uses",
                value: !spell.uses ? "Infinite" : spell.uses + "",
                inline: true
            },
            {
                name: "Cooldown",
                value: spell.cooldown + " seconds",
                inline: true
            },
            {
                name: "Role",
                value: spell.role.name,
                inline: true
            },
            // Shape and effects are separated because they may
            // take a lot of vertical space compared to other fields.
            { name: "", value: "" },
            {
                name: "Shape",
                value: shapeStr,
                inline: true,
            },
            {
                name: "Effects",
                value: spell.effects.map(effect => `- ${effect.description}`).join("\n"),
                inline: true
            }
        ]

        return {
            title: spell.name,
            fields
        }
    }
} as const

export default spellSearchHandler
