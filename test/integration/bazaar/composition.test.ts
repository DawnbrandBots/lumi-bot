import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { EBazaarResultKind } from "../../../src/application/bazaar/types.ts";
import type { TBazaarUseCases } from "../../../src/application/bazaar/useCases.types.ts";
import { composeApplication } from "../../../src/composition/application.ts";
import getWithinTransaction from "../../../src/composition/infrastructure/mikroOrm/withinTransaction.ts";
import { composeQueries } from "../../../src/composition/infrastructure/queries.ts";
import { composeRepositories } from "../../../src/composition/infrastructure/repositories.ts";
import { EListingSide } from "../../../src/domain/bazaar/models/listing.types.ts";
import { EWeaponVariant } from "../../../src/domain/game/models/weaponVariant.types.ts";
import { migrationMikroOrmConfig } from "../../mikro-orm.test.config.ts";
import getSameConfigInMemory from "../../utils/getSameConfigInMemory.ts";
import { EMPTY_SEARCH_ENGINE } from "../../utils/searchEngine.ts";

const WEAPON = { id: "weapon-1", level: 4, name: "Iron Sword" } as const;
const ITEM = { kind: "weapon", weaponId: WEAPON.id, variant: EWeaponVariant.ATK } as const;
const IDENTITY = { guildId: "guild-1", ownerId: "owner-1", side: EListingSide.SALE } as const;

describe("Bazaar composition", () => {
    let orm: MikroORM;
    let useCases: TBazaarUseCases;

    beforeEach(async () => {
        orm = await MikroORM.init(getSameConfigInMemory(migrationMikroOrmConfig));
        await orm.schema.create();
        const em = orm.em.fork({ useContext: true });
        const queries = composeQueries({ em, searchEngine: EMPTY_SEARCH_ENGINE });
        const repositories = composeRepositories({ em });
        useCases = composeApplication({
            queries: {
                bazaar: {
                    findDiscipleById: queries.bazaar.findDiscipleById,
                    findWeaponById: () => Promise.resolve(WEAPON),
                },
                search: queries.search,
            },
            repositories,
            useCaseMiddleware: getWithinTransaction(em),
        }).useCases.bazaar;
    });

    afterEach(async () => {
        await orm.close(true);
    });

    test("makes the composed Bazaar use cases operational", async () => {
        await expect(
            useCases.upsertListing({ ...IDENTITY, item: ITEM, quantity: 2, unitPrice: 100 }),
        ).resolves.toMatchObject({
            kind: EBazaarResultKind.LISTING_CREATED,
        });
        await expect(useCases.listListings({ guildId: IDENTITY.guildId, side: IDENTITY.side })).resolves.toMatchObject({
            kind: EBazaarResultKind.LISTINGS_LISTED,
            value: { listings: [{ ...IDENTITY, quantity: 2, unitPrice: 100 }] },
        });
        await expect(useCases.deleteListing({ ...IDENTITY, item: ITEM })).resolves.toMatchObject({
            kind: EBazaarResultKind.LISTING_DELETED,
        });
    });
});
