import { GOLD_MAX_AMOUNT, INVENTORY_WEAPON_MAX_AMOUNT } from "../../game/constants.ts";

export const BAZAAR_LISTING_MINIMUM_QUANTITY = 1;
/**
 * A player cannot have more than {@link INVENTORY_WEAPON_MAX_AMOUNT} weapons,
 * so they couldn't actually sell or buy more.
 *
 * This limit does not actually apply to souls in-game, the maximum quantity for souls is unknown.
 * I still chose to limit to {@link INVENTORY_WEAPON_MAX_AMOUNT} as to not allow arbitrarily huge numbers.
 */
export const BAZAAR_LISTING_MAXIMUM_QUANTITY = INVENTORY_WEAPON_MAX_AMOUNT;
/**
 * The minimum price for a listing in-game actually depends on the item.
 * Players may wish to create listings with prices lower than actually allowed in-game to express "donations".
 */
export const BAZAAR_LISTING_MINIMUM_PRICE = 1;
/**
 * The maximum price for a listing in-game actually depends on the item.
 * No item may actually be sold for the maximum amount of gold a player can have.
 * However, players may wish to trade items for prices higher than the game allows in a single trade.
 * This can be accomplished in-game by doing multiple transactions.
 */
export const BAZAAR_LISTING_MAXIMUM_PRICE = GOLD_MAX_AMOUNT;

export function isBazaarListingQuantityNumber(n: number): boolean {
    return Number.isInteger(n) && n >= BAZAAR_LISTING_MINIMUM_QUANTITY && n <= BAZAAR_LISTING_MAXIMUM_QUANTITY;
}

export function isBazaarListingPriceNumber(n: number): boolean {
    return Number.isInteger(n) && n >= BAZAAR_LISTING_MINIMUM_PRICE && n <= BAZAAR_LISTING_MAXIMUM_PRICE;
}
