import { DISCIPLE_BASE_ATK, DISCIPLE_BASE_HP } from "./constants.ts";
import type { IDisciple } from "./types.ts";

// TODO: review and document the following types

type SubsetShape<T> = {
    [TKey in keyof T]?: T[TKey] extends object ? true | SubsetShape<T[TKey]> : true;
};

type Subset<T, TShape extends SubsetShape<T>> = {
    [TKey in keyof TShape & keyof T]: NonNullable<TShape[TKey]> extends true
        ? T[TKey]
        : NonNullable<TShape[TKey]> extends SubsetShape<T[TKey]>
          ? Subset<T[TKey], NonNullable<TShape[TKey]>>
          : never;
};

export function getDiscipleBaseHp(arg: Subset<IDisciple, { movementType: { discipleBaseHpModifier: true } }>): number {
    return Math.floor(DISCIPLE_BASE_HP * arg.movementType.discipleBaseHpModifier);
}

export function getDiscipleBaseAtk(
    arg: Subset<
        IDisciple,
        { movementType: { discipleBaseAtkModifier: true }; weaponType: { discipleBaseAtkModifier: true } }
    >,
): number {
    return Math.floor(
        DISCIPLE_BASE_ATK * arg.movementType.discipleBaseAtkModifier * arg.weaponType.discipleBaseAtkModifier,
    );
}

export function getDiscipleHp(
    arg: { discipleData: Subset<IDisciple, { baseHp: true }> } & Parameters<IDisciple["getHp"]>[0],
): number {
    return Math.floor(arg.discipleData.baseHp * (1 + 0.1 * (arg.level - 1)));
}

export function getDiscipleAtk(
    arg: { discipleData: Subset<IDisciple, { baseAtk: true }> } & Parameters<IDisciple["getAtk"]>[0],
): number {
    return Math.floor(arg.discipleData.baseAtk * (1 + 0.1 * (arg.level - 1)));
}
