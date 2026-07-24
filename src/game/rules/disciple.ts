import type { PickDeep } from "type-fest";
import type { IDisciple } from "../types.ts";

export function baseHp(arg: PickDeep<IDisciple, "movementType.baseHp">): number {
    return arg.movementType.baseHp;
}

export function baseAtk(arg: PickDeep<IDisciple, "movementType.baseAtkByRange" | "weaponType.range">): number {
    return arg.movementType.baseAtkByRange[arg.weaponType.range];
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
