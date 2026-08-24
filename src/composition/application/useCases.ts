import type { EntityManager } from "@mikro-orm/sqlite";
import type { MaybePromise } from "../../utils/types.ts";

export function getPersistenceWithContext<Persistence>(arg: {
    readonly em: EntityManager;
    readonly repositories: object;
}): Persistence {
    return new Proxy(arg.repositories, {
        get(target, property, receiver) {
            const repository = Reflect.get(target, property, receiver);
            return typeof repository === "function"
                ? (repositoryArg: unknown) => repository({ em: arg.em }, repositoryArg)
                : repository;
        },
    }) as unknown as Persistence;
}

type TWithUnitOfWork = (
    useCase: (dependencies: unknown, ...args: never[]) => MaybePromise<unknown>,
) => (...args: never[]) => Promise<unknown>;

export function getUseCasesWithUnitOfWork<UseCases>(arg: {
    readonly useCases: object;
    readonly withUnitOfWork: TWithUnitOfWork;
}): UseCases {
    return new Proxy(arg.useCases, {
        get(target, property, receiver) {
            const useCase = Reflect.get(target, property, receiver);
            return typeof useCase === "function"
                ? arg.withUnitOfWork(useCase as (dependencies: unknown, ...args: never[]) => MaybePromise<unknown>)
                : useCase;
        },
    }) as unknown as UseCases;
}
