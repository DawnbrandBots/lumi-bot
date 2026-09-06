import type { EntityManager } from "@mikro-orm/sqlite";
import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";

export type TLfgRepositoryContext = {
    readonly em: EntityManager;
};

export type TLfgRepositoryFunction<Function extends (...args: never[]) => unknown> = (
    context: TLfgRepositoryContext,
    arg: Parameters<Function>[0],
) => ReturnType<Function>;

export type TLfgRepositoryMap = {
    readonly [Key in keyof TLfgRepository]: TLfgRepositoryFunction<TLfgRepository[Key]>;
};
