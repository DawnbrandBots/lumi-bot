import { describe, expect, test } from "vitest";
import {
    BAZAAR_DUPLICATE_SALE_DESCRIPTION,
    BAZAAR_EMPTY_LIST_DESCRIPTION,
    BAZAAR_INVALID_ITEM_DESCRIPTION,
} from "../../src/bazaar/constants.ts";
import mapBazaarFeatureReturnToMessage from "../../src/bazaar/mapper.ts";
import { EBazaarFeatureReturnKind, type ISaleListing } from "../../src/bazaar/types.ts";

const SALE_WITH_PRICE: ISaleListing = {
    id: "12345678-1234-1234-1234-123456789abc",
    sellerId: "seller",
    weaponId: "ROYAL_SWORD_PLUS",
    weaponName: "Royal Sword +",
    variant: "ATK",
    quantity: 2,
    price: 5000,
    createdAt: new Date("2026-06-12T00:00:00.000Z"),
};

const SALE_WITHOUT_PRICE: ISaleListing = {
    ...SALE_WITH_PRICE,
    id: "abcdef12-1234-1234-1234-123456789abc",
    sellerId: "other-seller",
    variant: "NEUTRAL",
    quantity: 1,
    price: null,
};

describe(mapBazaarFeatureReturnToMessage.name, () => {
    test("formats empty list messages", () => {
        const message = mapBazaarFeatureReturnToMessage({
            kind: EBazaarFeatureReturnKind.SALES_LISTED,
            value: { sales: [] },
        });

        expect(message.embeds[0]?.description).toBe(BAZAAR_EMPTY_LIST_DESCRIPTION);
    });

    test("formats sale list with and without price", () => {
        const message = mapBazaarFeatureReturnToMessage({
            kind: EBazaarFeatureReturnKind.SALES_LISTED,
            value: { sales: [SALE_WITH_PRICE, SALE_WITHOUT_PRICE] },
        });

        expect(message.embeds[0]?.description).toContain("- `12345678` | <@seller> | Royal Sword + | Atk | x2 | 5,000");
        expect(message.embeds[0]?.description).toContain(
            "- `abcdef12` | <@other-seller> | Royal Sword + | (-) | x1 | No price",
        );
    });

    test("formats duplicate and invalid item messages", () => {
        expect(
            mapBazaarFeatureReturnToMessage({ kind: EBazaarFeatureReturnKind.DUPLICATE_SALE }).embeds[0]?.description,
        ).toBe(BAZAAR_DUPLICATE_SALE_DESCRIPTION);
        expect(
            mapBazaarFeatureReturnToMessage({ kind: EBazaarFeatureReturnKind.INVALID_ITEM }).embeds[0]?.description,
        ).toBe(BAZAAR_INVALID_ITEM_DESCRIPTION);
    });
});
