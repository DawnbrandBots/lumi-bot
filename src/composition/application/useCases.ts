import ADMIN_USE_CASES from "../../application/admin/useCases.ts";
import LFG_USE_CASES from "../../application/lfg/useCases.ts";
import type { TApplicationQueries } from "../../application/queries.types.ts";
import type { TApplicationRepositories } from "../../application/repositories.types.ts";
import SEARCH_USE_CASES from "../../application/search/useCases.ts";
import type { TApplicationUseCases } from "../../application/useCases.types.ts";
import {
    buildDependentFunctionsRecord,
    type TBuildableFunctionMiddleware,
} from "../utils/buildDependentFunctionsRecord.ts";
import type { TApplicationServices } from "./services.ts";

const USE_CASES = {
    admin: ADMIN_USE_CASES,
    lfg: LFG_USE_CASES,
    search: SEARCH_USE_CASES,
} as const;

export function composeUseCases({
    queries,
    repositories,
    services,
    middleware,
}: {
    readonly queries: TApplicationQueries;
    readonly repositories: TApplicationRepositories;
    readonly services: TApplicationServices;
    readonly middleware: TBuildableFunctionMiddleware;
}): TApplicationUseCases {
    // TODO: ultimately, there should be a function that takes a record of record of useCases and builds all at once.
    // TODO: should composed types be introduced for objects like builtUseCases?
    return {
        admin: buildDependentFunctionsRecord({ repositories }, USE_CASES.admin, middleware),
        lfg: buildDependentFunctionsRecord({ repositories, services: services.lfg }, USE_CASES.lfg, middleware),
        search: buildDependentFunctionsRecord({ queries }, USE_CASES.search, middleware),
    };
}
