import type { EntityManager } from "@mikro-orm/sqlite";
import type { TApplicationRepositories } from "../../application/repositories.types.ts";
import ADMIN_REPOSITORY from "../../infrastructure/persistence/mikroOrm/repositories/admin.ts";
import LFG_REPOSITORY from "../../infrastructure/persistence/mikroOrm/repositories/lfg.ts";
import { buildDependentFunctionsRecord } from "../utils/buildDependentFunctionsRecord.ts";

const REPOSITORIES = {
    // TODO: might be better if repositories are organized by aggregate instead of "feature"
    admin: ADMIN_REPOSITORY,
    lfg: LFG_REPOSITORY,
} as const;

export function composeRepositories({ em }: { readonly em: EntityManager }): TApplicationRepositories {
    return {
        admin: buildDependentFunctionsRecord({ em }, REPOSITORIES.admin),
        lfg: buildDependentFunctionsRecord({ em }, REPOSITORIES.lfg),
    };
}
