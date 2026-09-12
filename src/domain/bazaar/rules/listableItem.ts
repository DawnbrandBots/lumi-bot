import type { IDisciple } from "../../game/models/disciple.types.ts";

export const BAZAAR_LISTABLE_WEAPON_LEVELS: ReadonlySet<number> = new Set([4, 6, 7, 8]);

export function isListableWeaponLevel(n: number): boolean {
    return BAZAAR_LISTABLE_WEAPON_LEVELS.has(n);
}

export function isDiscipleWithListableSoul(disciple: Pick<IDisciple, "isBattlePassDisciple">): boolean {
    return disciple.isBattlePassDisciple;
}
