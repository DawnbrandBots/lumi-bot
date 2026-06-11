import { userMention, type InteractionReplyOptions } from "discord.js";
import {
    createErrorMessage,
    createNegativeMessage,
    createNeutralMessage,
    createPositiveMessage,
} from "../bot/message.ts";
import {
    BAZAAR_DUPLICATE_SALE_DESCRIPTION,
    BAZAAR_EMPTY_LIST_DESCRIPTION,
    BAZAAR_INVALID_ITEM_DESCRIPTION,
    BAZAAR_INVALID_PRICE_DESCRIPTION,
    BAZAAR_INVALID_QUANTITY_DESCRIPTION,
    BAZAAR_INVALID_SUBCOMMAND_DESCRIPTION,
    BAZAAR_SHORT_SALE_ID_LENGTH,
} from "./constants.ts";
import {
    EBazaarFeatureReturnKind,
    type ISaleListing,
    type TBazaarFeatureReturn,
    type TBazaarWeaponVariant,
} from "./types.ts";

export function formatVariant(variant: TBazaarWeaponVariant): string {
    switch (variant) {
        case "ATK":
            return "Atk";
        case "NEUTRAL":
            return "(-)";
        case "HP":
            return "HP";
    }
}

function formatPrice(price: number | null): string {
    return price == null ? "No price" : price.toLocaleString("en-US");
}

function formatSaleId(id: string): string {
    return id.slice(0, BAZAAR_SHORT_SALE_ID_LENGTH);
}

function formatSale(sale: ISaleListing): string {
    return [
        `\`${formatSaleId(sale.id)}\``,
        userMention(sale.sellerId),
        sale.weaponName,
        formatVariant(sale.variant),
        `x${sale.quantity}`,
        formatPrice(sale.price),
    ].join(" | ");
}

function formatSaleList(sales: readonly ISaleListing[]): string {
    if (sales.length === 0) {
        return BAZAAR_EMPTY_LIST_DESCRIPTION;
    }
    return sales.map((sale) => `- ${formatSale(sale)}`).join("\n");
}

function formatSaleCreated(sale: ISaleListing): string {
    return `Listed ${sale.weaponName} ${formatVariant(sale.variant)} x${sale.quantity} for ${formatPrice(sale.price)}.`;
}

export default function mapBazaarFeatureReturnToMessage(result: TBazaarFeatureReturn) {
    switch (result.kind) {
        case EBazaarFeatureReturnKind.SALES_LISTED:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: { title: "Bazaar listings", description: formatSaleList(result.value.sales) },
            });
        case EBazaarFeatureReturnKind.SALE_CREATED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: { description: formatSaleCreated(result.value.sale) },
            });
        case EBazaarFeatureReturnKind.DUPLICATE_SALE:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: { description: BAZAAR_DUPLICATE_SALE_DESCRIPTION },
            });
        case EBazaarFeatureReturnKind.INVALID_ITEM:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: { description: BAZAAR_INVALID_ITEM_DESCRIPTION },
            });
        case EBazaarFeatureReturnKind.INVALID_QUANTITY:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: { description: BAZAAR_INVALID_QUANTITY_DESCRIPTION },
            });
        case EBazaarFeatureReturnKind.INVALID_PRICE:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: { description: BAZAAR_INVALID_PRICE_DESCRIPTION },
            });
        case EBazaarFeatureReturnKind.INVALID_SUBCOMMAND:
            return createErrorMessage<InteractionReplyOptions>({
                embed: { description: BAZAAR_INVALID_SUBCOMMAND_DESCRIPTION },
            });
    }
}
