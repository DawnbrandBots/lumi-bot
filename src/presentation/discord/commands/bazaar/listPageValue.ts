import type { TBazaarUseCaseArgs } from "../../../../application/bazaar/useCases.types.ts";
import { EListingSide } from "../../../../domain/bazaar/models/listing.types.ts";
import { BAZAAR_LIST_COMPONENT_PREFIX } from "./constants.ts";
import { formatListableItemValue, parseListableItemValue } from "./itemValue.ts";

export type TBazaarListPage = {
    readonly filter: TBazaarUseCaseArgs["listListings"];
    readonly page: number;
};

export function formatBazaarListPageValue({ filter, page }: TBazaarListPage): string {
    return [
        BAZAAR_LIST_COMPONENT_PREFIX,
        filter.side,
        filter.ownerId ?? "",
        filter.item ? formatListableItemValue(filter.item) : "",
        page,
    ].join("|");
}

export function parseBazaarListPageValue(value: string, guildId: string): TBazaarListPage | null {
    const [prefix, side, ownerId, itemValue, pageValue, ...extra] = value.split("|");
    const page = Number(pageValue);
    const item = itemValue ? parseListableItemValue(itemValue) : undefined;
    if (
        prefix !== BAZAAR_LIST_COMPONENT_PREFIX ||
        (side !== EListingSide.PURCHASE && side !== EListingSide.SALE) ||
        (itemValue && !item) ||
        !Number.isSafeInteger(page) ||
        page < 1 ||
        extra.length
    ) {
        return null;
    }
    return {
        filter: {
            guildId,
            side,
            ...(ownerId ? { ownerId } : {}),
            ...(item ? { item } : {}),
        },
        page,
    };
}
