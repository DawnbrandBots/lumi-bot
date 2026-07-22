import { DISCIPLE_BASE_ATK, DISCIPLE_BASE_HP } from "../constants.ts";
import type { IDisciple } from "../types.ts";
import type { DeepPick } from "../../utils/types.ts";

/** Calculates a disciple's base HP from its movement type modifier. */
function baseHp(arg: DeepPick<IDisciple, { movementType: { discipleBaseHpModifier: true } }>): number {
    return Math.floor(DISCIPLE_BASE_HP * arg.movementType.discipleBaseHpModifier);
}

/** Calculates a disciple's base Atk from its movement and weapon type modifiers. */
function baseAtk(
    arg: DeepPick<
        IDisciple,
        { movementType: { discipleBaseAtkModifier: true }; weaponType: { discipleBaseAtkModifier: true } }
    >,
): number {
    return Math.floor(
        DISCIPLE_BASE_ATK * arg.movementType.discipleBaseAtkModifier * arg.weaponType.discipleBaseAtkModifier,
    );
}

/** Calculates a disciple's HP at a given level from its base HP. */
function hp(arg: { discipleData: DeepPick<IDisciple, { baseHp: true }> } & Parameters<IDisciple["getHp"]>[0]): number {
    return Math.floor(arg.discipleData.baseHp * (1 + 0.1 * (arg.level - 1)));
}

/** Calculates a disciple's Atk at a given level from its base Atk. */
function atk(
    arg: { discipleData: DeepPick<IDisciple, { baseAtk: true }> } & Parameters<IDisciple["getAtk"]>[0],
): number {
    return Math.floor(arg.discipleData.baseAtk * (1 + 0.1 * (arg.level - 1)));
}

/** Domain rules for disciples. */
export const Disciple = {
    baseAtk,
    baseHp,
    atk,
    hp,
};
