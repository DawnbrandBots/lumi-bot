import { describe, expect, test } from "vitest";
import { upsertListing } from "../../../../src/application/bazaar/useCases/upsertListing.ts";
import { EBazaarResultKind } from "../../../../src/application/bazaar/types.ts";
import { EListingSide, type IListing } from "../../../../src/domain/bazaar/models/listing.types.ts";
import {
    DISCIPLE,
    GUILD_ID,
    getBazaarDependencies,
    LISTING,
    OWNER_ID,
    SOUL_REFERENCE,
    WEAPON,
    WEAPON_ITEM,
    WEAPON_REFERENCE,
} from "./fixtures.ts";

const ARG = {
    guildId: GUILD_ID,
    ownerId: OWNER_ID,
    side: EListingSide.SALE,
    item: WEAPON_REFERENCE,
} as const;

describe(upsertListing.name, () => {
    test("resolves a weapon and supplies its listing terms", async () => {
        const { dependencies, upsertListing: upsertListingRepository } = getBazaarDependencies();

        const result = await upsertListing(dependencies, { ...ARG, quantity: 2, unitPrice: 10_000 });

        expect(result).toEqual({ kind: EBazaarResultKind.LISTING_CREATED, value: { listing: LISTING } });
        expect(upsertListingRepository).toHaveBeenCalledWith({
            identity: { guildId: GUILD_ID, ownerId: OWNER_ID, side: EListingSide.SALE },
            item: WEAPON_ITEM,
            quantity: 2,
            unitPrice: 10_000,
        });
    });

    test("delegates omitted listing terms to the repository", async () => {
        const { dependencies, upsertListing: upsertListingRepository } = getBazaarDependencies();

        await upsertListing(dependencies, ARG);

        expect(upsertListingRepository).toHaveBeenCalledWith({
            identity: { guildId: GUILD_ID, ownerId: OWNER_ID, side: EListingSide.SALE },
            item: WEAPON_ITEM,
        });
    });

    test("preserves explicit null listing terms", async () => {
        const { dependencies, upsertListing: upsertListingRepository } = getBazaarDependencies();

        await upsertListing(dependencies, { ...ARG, quantity: null, unitPrice: null });

        expect(upsertListingRepository).toHaveBeenCalledWith(
            expect.objectContaining({
                quantity: null,
                unitPrice: null,
            }),
        );
    });

    test("resolves a battle-pass disciple into a soul item", async () => {
        const soulListing = {
            ...LISTING,
            item: { kind: "soul", disciple: { id: DISCIPLE.id, name: DISCIPLE.name } },
        } as const satisfies IListing;
        const {
            dependencies,
            findDiscipleById,
            upsertListing: upsertListingRepository,
        } = getBazaarDependencies({
            upsertListingResult: { previous: null, current: soulListing },
        });

        const result = await upsertListing(dependencies, { ...ARG, item: SOUL_REFERENCE });

        expect(findDiscipleById).toHaveBeenCalledWith({ discipleId: DISCIPLE.id });
        expect(upsertListingRepository).toHaveBeenCalledWith(expect.objectContaining({ item: soulListing.item }));
        expect(result).toEqual({ kind: EBazaarResultKind.LISTING_CREATED, value: { listing: soulListing } });
    });

    test.each([
        ["quantity below its range", { quantity: 0 }, EBazaarResultKind.INVALID_QUANTITY],
        ["fractional quantity", { quantity: 1.5 }, EBazaarResultKind.INVALID_QUANTITY],
        ["price below its range", { unitPrice: 0 }, EBazaarResultKind.INVALID_PRICE],
        ["fractional price", { unitPrice: 1.5 }, EBazaarResultKind.INVALID_PRICE],
    ] as const)("rejects %s before querying game data", async (_name, terms, expectedKind) => {
        const {
            dependencies,
            findDiscipleById,
            findWeaponById,
            upsertListing: upsertListingRepository,
        } = getBazaarDependencies();

        const result = await upsertListing(dependencies, { ...ARG, ...terms });

        expect(result).toEqual({ kind: expectedKind });
        expect(findDiscipleById).not.toHaveBeenCalled();
        expect(findWeaponById).not.toHaveBeenCalled();
        expect(upsertListingRepository).not.toHaveBeenCalled();
    });

    test.each([
        ["missing weapon", WEAPON_REFERENCE, null, DISCIPLE],
        ["ineligible weapon", WEAPON_REFERENCE, { ...WEAPON, level: 5 }, DISCIPLE],
        ["missing disciple", SOUL_REFERENCE, WEAPON, null],
        ["ineligible soul", SOUL_REFERENCE, WEAPON, { ...DISCIPLE, isBattlePassDisciple: false }],
    ] as const)("rejects a %s", async (_name, item, findWeaponByIdResult, findDiscipleByIdResult) => {
        const { dependencies, upsertListing: upsertListingRepository } = getBazaarDependencies({
            findWeaponByIdResult,
            findDiscipleByIdResult,
        });

        const result = await upsertListing(dependencies, { ...ARG, item });

        expect(result).toEqual({ kind: EBazaarResultKind.INVALID_ITEM });
        expect(upsertListingRepository).not.toHaveBeenCalled();
    });

    test.each([
        ["created", null, LISTING, EBazaarResultKind.LISTING_CREATED],
        ["unchanged", LISTING, LISTING, EBazaarResultKind.LISTING_UNCHANGED],
        [
            "updated",
            { ...LISTING, quantity: 1 },
            { ...LISTING, updatedAt: new Date("2026-10-02T10:00:00.000Z") },
            EBazaarResultKind.LISTING_UPDATED,
        ],
    ] as const)("reports a listing as %s", async (_name, previous, current, expectedKind) => {
        const { dependencies } = getBazaarDependencies({ upsertListingResult: { previous, current } });

        const result = await upsertListing(dependencies, ARG);

        expect(result).toEqual({ kind: expectedKind, value: { listing: current } });
    });
});
