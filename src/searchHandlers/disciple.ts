import { DISCIPLE_MAX_LEVEL, DISCIPLE_MINIMUM_RELEVANT_LEVEL } from "../constants.ts"
import { Disciple } from "../models.ts"
import { toAsciiTable } from "../utils/table.ts"

const discipleSearchHandler = {
    class: Disciple,
    response: (disciple: Disciple) => {
        // TODO: adding at least a thumbnail with the character's face would be nice
        // TODO: mention prf weapon

        const introduction = `**${disciple.name}** is a ${disciple.weaponType.name}-wielding ${disciple.movementType.name} disciple.`

        const spellsListStr = disciple.spells.map(spell => `- ${spell.name}`).join(", ")
        const spellsStr = `**Spells**: ${spellsListStr}`

        const columnCountAsideFromHeaderAndLevel1 = DISCIPLE_MAX_LEVEL - DISCIPLE_MINIMUM_RELEVANT_LEVEL + 1
        const baseStatsTable = [
            ["Level", 1, ...Array.from({ length: columnCountAsideFromHeaderAndLevel1 }, (_, i) => i + DISCIPLE_MINIMUM_RELEVANT_LEVEL)],
            ["HP", disciple.getHp({ level: 1 }), ...Array.from({ length: columnCountAsideFromHeaderAndLevel1 }, (_, i) => disciple.getHp({ level: i + DISCIPLE_MINIMUM_RELEVANT_LEVEL }))],
            ["Atk", disciple.getAtk({ level: 1 }), ...Array.from({ length: columnCountAsideFromHeaderAndLevel1 }, (_, i) => disciple.getAtk({ level: i + DISCIPLE_MINIMUM_RELEVANT_LEVEL }))],
        ]
        const baseStatsTableAscii = toAsciiTable({ data: baseStatsTable, cellPadding: 3 })
        const baseStatsStr = `**Base stats**\n\`\`\`\n${baseStatsTableAscii}\n\`\`\``

        return [introduction, spellsStr, baseStatsStr].join("\n\n")
    }
} as const

export default discipleSearchHandler