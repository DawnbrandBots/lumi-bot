import type { EntityManager } from "@mikro-orm/sqlite";
import type { TBazaarRepository } from "../../../../../application/bazaar/repositories.types.ts";
import type { TListableItemReference } from "../../../../../application/bazaar/types.ts";
import type { TListableItem } from "../../../../../domain/bazaar/models/listableItem.types.ts";

export type TBazaarRepositoryContext = {
    readonly em: EntityManager;
};

export type TBazaarRepositoryFunction<Function extends (...args: never[]) => unknown> = (
    context: TBazaarRepositoryContext,
    arg: Parameters<Function>[0],
) => ReturnType<Function>;

export type TBazaarRepositoryMap = {
    readonly [Key in keyof TBazaarRepository]: TBazaarRepositoryFunction<TBazaarRepository[Key]>;
};

export function getListableItemKey(item: TListableItem | TListableItemReference): string {
    switch (item.kind) {
        case "weapon":
            return `weapon:${"weapon" in item ? item.weapon.id : item.weaponId}:${item.variant}`;
        case "soul":
            return `soul:${"disciple" in item ? item.disciple.id : item.discipleId}`;
    }
}
