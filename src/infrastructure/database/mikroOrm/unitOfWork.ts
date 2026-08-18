import type { EntityManager } from "@mikro-orm/sqlite";
import type { MaybePromise } from "../../../utils/types.ts";

export function runInMikroOrmUnitOfWork<Return>(arg: {
    readonly em: EntityManager;
    readonly run: (em: EntityManager) => MaybePromise<Return>;
}): Promise<Return> {
    return arg.em.transactional(async (transactionalEm) => {
        const result = await arg.run(transactionalEm);
        await transactionalEm.flush();
        return result;
    });
}
