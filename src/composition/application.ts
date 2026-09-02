import type { TApplicationQueries } from "../application/queries.types.ts";
import type { TApplicationRepositories } from "../application/repositories.types.ts";
import type { TApplicationUseCases } from "../application/useCases.types.ts";
import type { TBuildableFunctionMiddleware } from "./utils/proxify.ts";
import { composeServices } from "./application/services.ts";
import { composeUseCases } from "./application/useCases.ts";

export function composeApplication({
    queries,
    repositories,
    useCaseMiddleware,
}: {
    readonly queries: TApplicationQueries;
    readonly repositories: TApplicationRepositories;
    readonly useCaseMiddleware: TBuildableFunctionMiddleware;
}): {
    readonly useCases: TApplicationUseCases;
} {
    const services = composeServices({ repositories });
    return {
        useCases: composeUseCases({ queries, repositories, services, middleware: useCaseMiddleware }),
    };
}
