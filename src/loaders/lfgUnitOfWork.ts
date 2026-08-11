import type { EntityManager } from "@mikro-orm/sqlite";
import type { TLfgUseCase, TWithLfgUnitOfWork } from "../application/lfg/types.ts";
import { getLfgPersistence } from "../infrastructure/lfg/persistence.ts";

export function getWithLfgUnitOfWork(em: EntityManager): TWithLfgUnitOfWork {
    return <Arg, Return>(useCase: TLfgUseCase<Arg, Return>) =>
        async (arg: Arg): Promise<Return> =>
        em.transactional(async (transactionalEm) => {
            const result = await useCase(getLfgPersistence({ em: transactionalEm }), arg);
            await transactionalEm.flush();
            return result;
        });
}
