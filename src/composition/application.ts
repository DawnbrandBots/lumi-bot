import type { TApplicationPersistence } from "../application/persistence.types.ts";
import type { TApplicationUseCases } from "../application/useCases.types.ts";
import type { TBuildableFunctionMiddleware } from "./utils/proxify.ts";
import { composeServices } from "./application/services.ts";
import { composeUseCases } from "./application/useCases.ts";

export function composeApplication({
    persistence,
    useCaseMiddleware,
}: {
    readonly persistence: TApplicationPersistence;
    readonly useCaseMiddleware: TBuildableFunctionMiddleware;
}): {
    readonly useCases: TApplicationUseCases;
} {
    const services = composeServices({ persistence });
    return {
        useCases: composeUseCases({ persistence, services, middleware: useCaseMiddleware }),
    };
}
