import { describe, expect, test } from "vitest";
import {
    BAZAAR_LISTING_MAXIMUM_PRICE,
    BAZAAR_LISTING_MAXIMUM_QUANTITY,
    BAZAAR_LISTING_MINIMUM_PRICE,
    BAZAAR_LISTING_MINIMUM_QUANTITY,
    isBazaarListingPriceNumber,
    isBazaarListingQuantityNumber,
} from "../../../../../src/domain/bazaar/rules/listing.ts";

describe(isBazaarListingQuantityNumber.name, () => {
    test.each([
        [-1, false],
        [0, false],
        // [BAZAAR_LISTING_MINIMUM_QUANTITY - 1, false], // if ever different from 1
        [BAZAAR_LISTING_MINIMUM_QUANTITY, true],
        [BAZAAR_LISTING_MAXIMUM_QUANTITY, true],
        [BAZAAR_LISTING_MAXIMUM_QUANTITY + 1, false],

        // data type tests (TS should prevent such input using tagged unions eventually?)
        [1.1, false],
        [NaN, false],
        [Infinity, false],
    ])("$0 => $1", (input, expected) => {
        expect(isBazaarListingQuantityNumber(input)).toBe(expected);
    });
});

describe(isBazaarListingPriceNumber.name, () => {
    test.each([
        [-1, false],
        [0, false],
        // [BAZAAR_LISTING_MINIMUM_PRICE - 1, false], // if ever different from 1
        [BAZAAR_LISTING_MINIMUM_PRICE, true],
        [BAZAAR_LISTING_MAXIMUM_PRICE, true],
        [BAZAAR_LISTING_MAXIMUM_PRICE + 1, false],

        // data type tests (TS should prevent such input using tagged unions eventually?)
        [1.1, false],
        [NaN, false],
        [Infinity, false],
    ])("$0 => $1", (input, expected) => {
        expect(isBazaarListingPriceNumber(input)).toBe(expected);
    });
});
