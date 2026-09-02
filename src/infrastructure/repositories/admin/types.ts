import type { EntityManager } from "@mikro-orm/sqlite";
import type { TAdminPersistence } from "../../../application/admin/persistence.types.ts";

export type TAdminPersistenceContext = {
    readonly em: EntityManager;
};

export type TAdminPersistenceFunction<Function extends (...args: never[]) => unknown> = (
    context: TAdminPersistenceContext,
    arg: Parameters<Function>[0],
) => ReturnType<Function>;

export type TAdminPersistenceMap = {
    readonly [Key in keyof TAdminPersistence]: TAdminPersistenceFunction<TAdminPersistence[Key]>;
};
