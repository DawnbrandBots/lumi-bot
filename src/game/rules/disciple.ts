import type { PickDeep } from "type-fest";
import { DISCIPLE_BASE_ATK, DISCIPLE_BASE_HP } from "../constants.ts";
import type { IDisciple } from "../types.ts";

export function baseHp(arg: PickDeep<IDisciple, "movementType.discipleBaseHpModifier">): number {
    return Math.floor(DISCIPLE_BASE_HP * arg.movementType.discipleBaseHpModifier);
}

export function baseAtk(
    arg: PickDeep<IDisciple, "movementType.discipleBaseAtkModifier" | "weaponType.discipleBaseAtkModifier">,
): number {
    return Math.floor(
        DISCIPLE_BASE_ATK * arg.movementType.discipleBaseAtkModifier * arg.weaponType.discipleBaseAtkModifier,
    );
}

export function hp(arg: { discipleData: PickDeep<IDisciple, "baseHp"> } & Parameters<IDisciple["getHp"]>[0]): number {
    return Math.floor(arg.discipleData.baseHp * (1 + 0.1 * (arg.level - 1)));
}

export function atk(
    arg: { discipleData: PickDeep<IDisciple, "baseAtk"> } & Parameters<IDisciple["getAtk"]>[0],
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
