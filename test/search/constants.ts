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
            "Sword + Royal",
            "Sword Plus Royal",
            "royalsword+",
            "royalswordplus",
            "ROYAL SWORD +",
            "ROYAL SWORD PLUS",
            "Royal +",
            "Royal Plus",
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
] as const;
