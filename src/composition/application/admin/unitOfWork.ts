import type { EntityManager } from "@mikro-orm/sqlite";
import type { TAdminPersistence } from "../../../application/admin/types.ts";
import { getAdminPersistence } from "../../../infrastructure/admin/persistence.ts";

export function getWithAdminUnitOfWork(em: EntityManager) {
    return <Args extends readonly unknown[], Return>(
            useCase: (persistence: TAdminPersistence, ...args: Args) => Promise<Return>,
        ) =>
        async (...args: Args): Promise<Return> =>
            em.transactional(async (transactionalEm) => {
                const result = await useCase(getAdminPersistence({ em: transactionalEm }), ...args);
                await transactionalEm.flush();
                return result;
            });
}
