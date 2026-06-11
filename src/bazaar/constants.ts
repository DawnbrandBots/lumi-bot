export const BAZAAR_COMMAND_NAME = "bazaar";

export const BAZAAR_SELL_SUBCOMMAND_NAME = "sell";
export const BAZAAR_LIST_SUBCOMMAND_NAME = "list";

export const BAZAAR_SELL_SUBCOMMAND_DESCRIPTION = "List a weapon for sale.";
export const BAZAAR_LIST_SUBCOMMAND_DESCRIPTION = "Display active Bazaar listings.";

export const BAZAAR_ITEM_OPTION_NAME = "item";
export const BAZAAR_VARIANT_OPTION_NAME = "variant";
export const BAZAAR_QUANTITY_OPTION_NAME = "quantity";
export const BAZAAR_PRICE_OPTION_NAME = "price";

export const BAZAAR_MIN_QUANTITY = 1;
export const BAZAAR_MIN_PRICE = 5_000;
export const BAZAAR_MAX_PRICE = 2_000_000;
export const BAZAAR_ALLOWED_WEAPON_LEVELS = [4, 6, 7, 8] as const;
export const BAZAAR_AUTOCOMPLETE_RESULTS_LIMIT = 5;
export const BAZAAR_SHORT_SALE_ID_LENGTH = 8;

export const BAZAAR_EMPTY_LIST_DESCRIPTION = "No active Bazaar listings.";
export const BAZAAR_INVALID_ITEM_DESCRIPTION = "Choose a weapon of level 4, 6, 7 or 8.";
export const BAZAAR_INVALID_QUANTITY_DESCRIPTION = `Quantity must be at least ${BAZAAR_MIN_QUANTITY}.`;
export const BAZAAR_INVALID_PRICE_DESCRIPTION = `Price must be between ${BAZAAR_MIN_PRICE} and ${BAZAAR_MAX_PRICE}.`;
export const BAZAAR_DUPLICATE_SALE_DESCRIPTION = "You already have an active listing for this weapon and variant.";
export const BAZAAR_INVALID_SUBCOMMAND_DESCRIPTION = "Please specify a valid Bazaar subcommand.";
