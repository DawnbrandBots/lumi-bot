import type { EntityManager } from "@mikro-orm/sqlite";
import type { TBuildableFunctionMiddleware } from "../utils/proxify.ts";

const getWithinTransaction: (em: EntityManager) => TBuildableFunctionMiddleware =
    // clear: true so the internally forked transactional em does not share its parent's identity map
    // https://mikro-orm.io/docs/transactions#context-propagation
    (em) => (f) => (dependencies, arg) =>
        em.transactional(() => Promise.resolve(f(dependencies, arg)), { clear: true });

export default getWithinTransaction;
