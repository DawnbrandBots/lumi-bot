import type { EntityManager } from "@mikro-orm/sqlite";
import { randomUUID } from "node:crypto";
import { Weapon } from "../game/models/weapon.ts";
import { BAZAAR_ALLOWED_WEAPON_LEVELS, BAZAAR_MAX_PRICE, BAZAAR_MIN_PRICE, BAZAAR_MIN_QUANTITY } from "./constants.ts";
import { BazaarSaleEntry } from "./models/saleEntry.ts";
import {
    EBazaarFeatureReturnKind,
    type IBazaarFeature,
    type IBazaarWeapon,
    type ISaleEntry,
    type ISaleListing,
    type IUser,
    type TBazaarWeaponVariant,
} from "./types.ts";

type BazaarFeatureCtorArg = {
    readonly em: EntityManager;
    readonly gameEm: EntityManager;
};

export class BazaarFeature implements IBazaarFeature {
    private readonly em: EntityManager;
    private readonly gameEm: EntityManager;

    public constructor({ em, gameEm }: BazaarFeatureCtorArg) {
        this.em = em;
        this.gameEm = gameEm;
    }

    public async list() {
        const sales = await this.em.find(BazaarSaleEntry, {}, { orderBy: { createdAt: "asc" } });
        const weaponNamesById = await this.getWeaponNamesById(sales.map((sale) => sale.weaponId));
        return {
            kind: EBazaarFeatureReturnKind.SALES_LISTED,
            value: {
                sales: sales.map((sale) =>
                    this.toSaleListing(sale, weaponNamesById.get(sale.weaponId) ?? sale.weaponId),
                ),
            },
        } as const;
    }

    public async sell(
        seller: IUser,
        weapon: IBazaarWeapon | null | undefined,
        variant: TBazaarWeaponVariant,
        quantity: number,
        price?: number | null,
    ) {
        if (!weapon || !this.isAllowedWeapon(weapon)) {
            return { kind: EBazaarFeatureReturnKind.INVALID_ITEM } as const;
        }
        if (!Number.isInteger(quantity) || quantity < BAZAAR_MIN_QUANTITY) {
            return { kind: EBazaarFeatureReturnKind.INVALID_QUANTITY } as const;
        }
        if (price != null && (!Number.isInteger(price) || price < BAZAAR_MIN_PRICE || price > BAZAAR_MAX_PRICE)) {
            return { kind: EBazaarFeatureReturnKind.INVALID_PRICE } as const;
        }

        const existingSale = await this.em.findOne(BazaarSaleEntry, {
            sellerId: seller.id,
            weaponId: weapon.id,
            variant,
        });
        if (existingSale) {
            return { kind: EBazaarFeatureReturnKind.DUPLICATE_SALE } as const;
        }

        const sale = this.em.create(BazaarSaleEntry, {
            id: randomUUID(),
            sellerId: seller.id,
            weaponId: weapon.id,
            variant,
            quantity,
            price: price ?? null,
        });
        await this.em.flush();

        return {
            kind: EBazaarFeatureReturnKind.SALE_CREATED,
            value: { sale: this.toSaleListing(sale, weapon.name) },
        } as const;
    }

    private isAllowedWeapon(weapon: IBazaarWeapon): boolean {
        const levels: ReadonlyArray<number> = BAZAAR_ALLOWED_WEAPON_LEVELS;
        return levels.includes(weapon.level);
    }

    private toSaleEntry(sale: BazaarSaleEntry): ISaleEntry {
        return {
            id: sale.id,
            sellerId: sale.sellerId,
            weaponId: sale.weaponId,
            variant: sale.variant,
            quantity: sale.quantity,
            price: sale.price ?? null,
            createdAt: sale.createdAt,
        };
    }

    private toSaleListing(sale: BazaarSaleEntry, weaponName: string): ISaleListing {
        return {
            // TODO: honestly, should just use a single db...?
            ...this.toSaleEntry(sale),
            weaponName,
        };
    }

    private async getWeaponNamesById(weaponIds: readonly string[]): Promise<Map<string, string>> {
        if (weaponIds.length === 0) {
            return new Map();
        }
        const weapons = await this.gameEm.find(Weapon, { id: { $in: [...new Set(weaponIds)] } });
        return new Map(weapons.map((weapon) => [weapon.id, weapon.name]));
    }
}
