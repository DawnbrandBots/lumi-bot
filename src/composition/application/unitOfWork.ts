import type { EntityManager } from "@mikro-orm/sqlite";
import { runInMikroOrmUnitOfWork } from "../../infrastructure/database/mikroOrm/unitOfWork.ts";
import type { MaybePromise } from "../../utils/types.ts";

export function getWithUnitOfWork<Dependencies>(arg: {
    readonly em: EntityManager;
    readonly getDependencies: (em: EntityManager) => Dependencies;
}) {
    return <Args extends readonly unknown[], Return>(
            useCase: (dependencies: Dependencies, ...args: Args) => MaybePromise<Return>,
        ) =>
        async (...args: Args): Promise<Return> =>
            runInMikroOrmUnitOfWork({
                em: arg.em,
                run: (transactionalEm) => useCase(arg.getDependencies(transactionalEm), ...args),
            });
}
