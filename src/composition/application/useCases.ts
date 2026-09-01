import ADMIN_USE_CASES from "../../application/admin/useCases.ts";
import LFG_USE_CASES from "../../application/lfg/useCases.ts";
import type { TApplicationPersistence } from "../../application/persistence.types.ts";
import SEARCH_USE_CASES from "../../application/search/useCases.ts";
import type { TApplicationUseCases } from "../../application/useCases.types.ts";
import { build, type TBuildableFunctionMiddleware } from "../utils/proxify.ts";
import type { TApplicationServices } from "./services.ts";

const USE_CASES = {
    admin: ADMIN_USE_CASES,
    lfg: LFG_USE_CASES,
    search: SEARCH_USE_CASES,
} as const;

export function composeUseCases({
    persistence,
    services,
    middleware,
}: {
    readonly persistence: TApplicationPersistence;
    readonly services: TApplicationServices;
    readonly middleware: TBuildableFunctionMiddleware;
}): TApplicationUseCases {
    // TODO: ultimately, there should be a function that takes a record of record of useCases and builds all at once.
    // TODO: should composed types be introduced for objects like builtUseCases?
    return {
        admin: build({ persistence }, USE_CASES.admin, middleware),
        lfg: build({ persistence, services: services.lfg }, USE_CASES.lfg, middleware),
        search: build({ persistence }, USE_CASES.search, middleware),
    };
}
