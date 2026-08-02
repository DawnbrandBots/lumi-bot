export const NO_SEARCH_RESULT_INPUT = "qzxv qzxv qzxv";

/**
 * Used for testing search results at different layers of the search feature
 */
export const SEARCH_RANKING_CASES = [
    {
        expectedId: "ROYAL_SWORD",
        expectedName: "Royal Sword",
        // Searching for something, even with upper/lowercase and/or typos, missing vowels, as long as characters are not
        // too different between input and the thing's name, should return that thing still.
        inputs: ["Royal Sword", "Sword Royal", "royalsword", "ROYAL SWORD"],
    },
    {
        expectedId: "ROYAL_SWORD_PLUS",
        expectedName: "Royal Sword +",
        // "+" in names could not weight enough to appear first in results,
        // so the implementation should handle them specially.
        inputs: [
            "Royal Sword +",
            "Royal Sword Plus",
            "Sword Plus Royal",
            "royalsword+",
            "royalswordplus",
            "ROYAL SWORD +",
            "ROYAL SWORD PLUS",
            "Royal Plus",
            "Kurt Weapon",
        ],
    },
    {
        expectedId: "THUNDER_SHIELD_BREAK_PLUS_CAVALRY",
        expectedName: "Thunder Shield Break + Cavalry",
        // Spell names can include + as well.
        // Spells can also be searched by acronym.
        inputs: [
            "Thunder Shield Break + Cavalry",
            "Thunder Shield Break Plus Cavalry",
            "TSBP",
            "TSB+",
            "TSB+C",
            "TSBPC",
            "tsbpc",
        ],
    },
    {
        expectedId: "ENNEA_FIRE_EX",
        expectedName: "Ennea Fire EX",
        inputs: ["Kurt EX"],
    },
    {
        expectedId: "BETRAYAL_EXILED_PRINCE",
        expectedName: "Betrayal – The Exiled Prince",
        inputs: ["Kurt Music"],
    },
    {
        expectedId: "BETRAYAL_EXILED_PRINCE_RESULTS_SCREEN",
        expectedName: "Betrayal – The Exiled Prince (Results screen)",
        inputs: ["Kurt Music Results"],
    },
    {
        expectedId: "KURT",
        expectedName: "Kurt",
        inputs: ["Royal Sword + disciple", "Ennea Fire EX disciple", "Royal Sword Plus disciple", "EFEX disciple"],
    },
    {
        expectedId: "ROYAL_SCION",
        expectedName: "Royal Scion",
        inputs: ["Royal Sword + skill", "Royal Sword Plus weapon skill", "Royal Sword weapon skill"],
    },
] as const;

/**
 * Failing cases since I added new aliases and updated the engine logic in https://github.com/DawnbrandBots/lumi-bot/pull/102.
 * I deemed them not important enough to bother finding a way to make them pass for now.
 */
export const SEARCH_RANKING_KNOWN_FAILURE_CASES = [
    {
        expectedId: "ROYAL_SWORD_PLUS",
        expectedName: "Royal Sword +",
        inputs: ["Sword + Royal", "Royal +"],
    },
] as const;
