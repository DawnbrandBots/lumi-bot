import type { EntityManager } from "@mikro-orm/sqlite";
import type { TAdminRepository } from "../../../../../application/admin/repositories.types.ts";

export type TAdminRepositoryContext = {
    readonly em: EntityManager;
};

export type TAdminRepositoryFunction<Function extends (...args: never[]) => unknown> = (
    context: TAdminRepositoryContext,
    arg: Parameters<Function>[0],
) => ReturnType<Function>;

export type TAdminRepositoryMap = {
    readonly [Key in keyof TAdminRepository]: TAdminRepositoryFunction<TAdminRepository[Key]>;
};
