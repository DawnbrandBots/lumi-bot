import type { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import recreateDb from "../../scripts/utils/recreateDb.ts";
import { BAZAAR_MAX_PRICE, BAZAAR_MIN_PRICE } from "../../src/bazaar/constants.ts";
import { BazaarFeature } from "../../src/bazaar/feature.ts";
import { EBazaarFeatureReturnKind, type IBazaarWeapon, type IUser } from "../../src/bazaar/types.ts";
import { configsById } from "../mikro-orm.test.config.ts";
import { initTestGameOrm, initTestLumiOrm } from "../orm.ts";

const SELLER: IUser = { id: "seller" };
const OTHER_SELLER: IUser = { id: "other-seller" };
const ALLOWED_WEAPON: IBazaarWeapon = { id: "ROYAL_SWORD_PLUS", name: "Royal Sword +", level: 8 };
const OTHER_ALLOWED_WEAPON: IBazaarWeapon = { id: "KADOMATSU_SWORD", name: "Kadomatsu Sword", level: 4 };
const INVALID_WEAPON: IBazaarWeapon = { id: "IRON_SWORD", name: "Iron Sword", level: 3 };

let orm: MikroORM;
let gameOrm: MikroORM;
let feature: BazaarFeature;

describe(BazaarFeature.name, () => {
    beforeEach(async () => {
        await recreateDb(configsById.lumi);
        orm = await initTestLumiOrm();
        gameOrm = await initTestGameOrm();
        feature = new BazaarFeature({ em: orm.em.fork(), gameEm: gameOrm.em.fork() });
    });

    afterEach(async () => {
        await orm.close(true);
        await gameOrm.close(true);
    });

    describe(BazaarFeature.prototype.sell.name, () => {
        test("creates a valid sale", async () => {
            const response = await feature.sell(SELLER, ALLOWED_WEAPON, "ATK", 2, 5000);

            expect(response.kind).toBe(EBazaarFeatureReturnKind.SALE_CREATED);
            expect(response).toMatchObject({
                value: {
                    sale: {
                        sellerId: SELLER.id,
                        weaponId: ALLOWED_WEAPON.id,
                        weaponName: ALLOWED_WEAPON.name,
                        variant: "ATK",
                        quantity: 2,
                        price: 5000,
                    },
                },
            });
        });

        test("rejects invalid weapon levels", async () => {
            const response = await feature.sell(SELLER, INVALID_WEAPON, "ATK", 1);

            expect(response).toEqual({ kind: EBazaarFeatureReturnKind.INVALID_ITEM });
        });

        test("rejects unknown weapons", async () => {
            const response = await feature.sell(SELLER, null, "ATK", 1);

            expect(response).toEqual({ kind: EBazaarFeatureReturnKind.INVALID_ITEM });
        });

        test("rejects duplicate seller weapon variant entries", async () => {
            await feature.sell(SELLER, ALLOWED_WEAPON, "ATK", 1);

            const response = await feature.sell(SELLER, ALLOWED_WEAPON, "ATK", 2);

            expect(response).toEqual({ kind: EBazaarFeatureReturnKind.DUPLICATE_SALE });
        });

        test("allows the same weapon and variant for different sellers", async () => {
            await feature.sell(SELLER, ALLOWED_WEAPON, "ATK", 1);

            const response = await feature.sell(OTHER_SELLER, ALLOWED_WEAPON, "ATK", 1);

            expect(response.kind).toBe(EBazaarFeatureReturnKind.SALE_CREATED);
        });

        test("allows the same seller and weapon with a different variant", async () => {
            await feature.sell(SELLER, ALLOWED_WEAPON, "ATK", 1);

            const response = await feature.sell(SELLER, ALLOWED_WEAPON, "HP", 1);

            expect(response.kind).toBe(EBazaarFeatureReturnKind.SALE_CREATED);
        });

        test.each([0, 1.5])("rejects invalid quantity %s", async (quantity) => {
            const response = await feature.sell(SELLER, ALLOWED_WEAPON, "ATK", quantity);

            expect(response).toEqual({ kind: EBazaarFeatureReturnKind.INVALID_QUANTITY });
        });

        test.each([BAZAAR_MIN_PRICE - 1, BAZAAR_MAX_PRICE + 1, 1.5])("rejects invalid price %s", async (price) => {
            const response = await feature.sell(SELLER, ALLOWED_WEAPON, "ATK", 1, price);

            expect(response).toEqual({ kind: EBazaarFeatureReturnKind.INVALID_PRICE });
        });
    });

    describe(BazaarFeature.prototype.list.name, () => {
        test("lists sales in creation order", async () => {
            await feature.sell(SELLER, ALLOWED_WEAPON, "ATK", 1);
            await feature.sell(OTHER_SELLER, OTHER_ALLOWED_WEAPON, "HP", 3);

            const response = await feature.list();

            expect(response).toMatchObject({
                kind: EBazaarFeatureReturnKind.SALES_LISTED,
                value: {
                    sales: [
                        { sellerId: SELLER.id, weaponName: ALLOWED_WEAPON.name, variant: "ATK", quantity: 1 },
                        {
                            sellerId: OTHER_SELLER.id,
                            weaponName: OTHER_ALLOWED_WEAPON.name,
                            variant: "HP",
                            quantity: 3,
                        },
                    ],
                },
            });
        });
    });
});
