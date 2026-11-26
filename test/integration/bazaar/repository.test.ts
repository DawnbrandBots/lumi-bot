import { MikroORM, type EntityManager } from "@mikro-orm/sqlite";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { EListingSide } from "../../../src/domain/bazaar/models/listing.types.ts";
import { EWeaponVariant } from "../../../src/domain/game/models/weaponVariant.types.ts";
import { BazaarListing } from "../../../src/infrastructure/persistence/mikroOrm/models/bazaar/listing.ts";
import { deleteListing } from "../../../src/infrastructure/persistence/mikroOrm/repositories/bazaar/deleteListing.ts";
import { listListings } from "../../../src/infrastructure/persistence/mikroOrm/repositories/bazaar/listListings.ts";
import { upsertListing } from "../../../src/infrastructure/persistence/mikroOrm/repositories/bazaar/upsertListing.ts";
import { migrationMikroOrmConfig } from "../../mikro-orm.test.config.ts";
import getSameConfigInMemory from "../../utils/getSameConfigInMemory.ts";

const WEAPON = { kind: "weapon", weapon: { id: "weapon-1", name: "Iron Sword" }, variant: EWeaponVariant.ATK } as const;
const WEAPON_REFERENCE = { kind: "weapon", weaponId: WEAPON.weapon.id, variant: WEAPON.variant } as const;
const SOUL = { kind: "soul", disciple: { id: "disciple-1", name: "Alfonse" } } as const;
const SOUL_REFERENCE = { kind: "soul", discipleId: SOUL.disciple.id } as const;
const IDENTITY = { guildId: "guild-1", ownerId: "owner-1", side: EListingSide.SALE } as const;

const config = getSameConfigInMemory(migrationMikroOrmConfig);

describe("Bazaar repository", () => {
    let orm: MikroORM;
    let em: EntityManager;

    beforeEach(async () => {
        orm = await MikroORM.init(config);
        await orm.schema.create();
        em = orm.em.fork();
    });

    afterEach(async () => {
        vi.useRealTimers();
        await orm.close(true);
    });

    test("creates a listing with omitted terms set to null", async () => {
        vi.setSystemTime(new Date("2026-10-25T08:00:00.000Z"));

        const result = await upsertListing({ em }, { identity: IDENTITY, item: WEAPON });
        await em.flush();

        expect(result).toEqual({
            previous: null,
            current: {
                ...IDENTITY,
                item: WEAPON,
                quantity: null,
                unitPrice: null,
                createdAt: new Date("2026-10-25T08:00:00.000Z"),
                updatedAt: new Date("2026-10-25T08:00:00.000Z"),
            },
        });
        expect(await em.count(BazaarListing)).toBe(1);
    });

    test("updates only supplied terms", async () => {
        await upsertListing({ em }, { identity: IDENTITY, item: WEAPON, quantity: 2, unitPrice: 100 });
        await em.flush();
        em.clear();

        const result = await upsertListing({ em }, { identity: IDENTITY, item: WEAPON, quantity: 3 });
        await em.flush();

        expect(result.previous).toMatchObject({ quantity: 2, unitPrice: 100 });
        expect(result.current).toMatchObject({ quantity: 3, unitPrice: 100 });
        expect(await em.count(BazaarListing)).toBe(1);
    });

    test("does not change the update time when the resulting terms are unchanged", async () => {
        vi.setSystemTime(new Date("2026-10-25T08:00:00.000Z"));
        await upsertListing({ em }, { identity: IDENTITY, item: WEAPON, quantity: 2 });
        await em.flush();
        em.clear();
        vi.setSystemTime(new Date("2026-10-25T09:00:00.000Z"));

        const result = await upsertListing({ em }, { identity: IDENTITY, item: WEAPON });

        expect(result.current.updatedAt).toEqual(new Date("2026-10-25T08:00:00.000Z"));
    });

    test("treats side and item as parts of listing identity", async () => {
        await upsertListing({ em }, { identity: IDENTITY, item: WEAPON });
        await upsertListing({ em }, { identity: { ...IDENTITY, side: EListingSide.PURCHASE }, item: WEAPON });
        await upsertListing({ em }, { identity: IDENTITY, item: SOUL });
        await em.flush();

        expect(await em.count(BazaarListing)).toBe(3);
    });

    test.each([
        ["owner", { guildId: IDENTITY.guildId, side: IDENTITY.side, ownerId: IDENTITY.ownerId }, 2],
        ["item", { guildId: IDENTITY.guildId, side: IDENTITY.side, item: WEAPON_REFERENCE }, 1],
        ["side", { guildId: IDENTITY.guildId, side: EListingSide.PURCHASE }, 1],
    ] as const)("filters listings by %s", async (_name, filter, expectedCount) => {
        await upsertListing({ em }, { identity: IDENTITY, item: WEAPON });
        await upsertListing({ em }, { identity: IDENTITY, item: SOUL });
        await upsertListing({ em }, { identity: { ...IDENTITY, side: EListingSide.PURCHASE }, item: WEAPON });
        await upsertListing({ em }, { identity: { ...IDENTITY, ownerId: "owner-2" }, item: SOUL });
        await em.flush();

        const listings = await listListings({ em }, filter);

        expect(listings).toHaveLength(expectedCount);
    });

    test("deletes and returns an existing listing", async () => {
        await upsertListing({ em }, { identity: IDENTITY, item: SOUL, quantity: 4 });
        await em.flush();

        const deleted = await deleteListing({ em }, { ...IDENTITY, item: SOUL_REFERENCE });
        await em.flush();

        expect(deleted).toMatchObject({ ...IDENTITY, item: SOUL, quantity: 4 });
        expect(await em.count(BazaarListing)).toBe(0);
    });

    test("returns null when deleting a missing listing", async () => {
        await expect(deleteListing({ em }, { ...IDENTITY, item: WEAPON_REFERENCE })).resolves.toBeNull();
    });
});
