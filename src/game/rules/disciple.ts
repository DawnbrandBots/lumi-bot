import { DISCIPLE_BASE_ATK, DISCIPLE_BASE_HP } from "../constants.ts";
import type { IDisciple } from "../types.ts";
import type { DeepPick } from "../../utils/types.ts";

export function baseHp(arg: DeepPick<IDisciple, { movementType: { discipleBaseHpModifier: true } }>): number {
    return Math.floor(DISCIPLE_BASE_HP * arg.movementType.discipleBaseHpModifier);
}

export function baseAtk(
    arg: DeepPick<
        IDisciple,
        { movementType: { discipleBaseAtkModifier: true }; weaponType: { discipleBaseAtkModifier: true } }
    >,
): number {
    return Math.floor(
        DISCIPLE_BASE_ATK * arg.movementType.discipleBaseAtkModifier * arg.weaponType.discipleBaseAtkModifier,
    );
}

export function hp(
    arg: { discipleData: DeepPick<IDisciple, { baseHp: true }> } & Parameters<IDisciple["getHp"]>[0],
): number {
    return Math.floor(arg.discipleData.baseHp * (1 + 0.1 * (arg.level - 1)));
}

export function atk(
    arg: { discipleData: DeepPick<IDisciple, { baseAtk: true }> } & Parameters<IDisciple["getAtk"]>[0],
): number {
    return Math.floor(arg.discipleData.baseAtk * (1 + 0.1 * (arg.level - 1)));
}

const Disciple = {
    baseAtk,
    baseHp,
    atk,
    hp,
};

export default Disciple;
