import type { EntityManager } from "@mikro-orm/sqlite";
import { getAdminFeature } from "../../../application/admin/feature.ts";
import type { TAdminFeature } from "../../../application/admin/types.ts";
import { getAdminPersistence } from "../../../infrastructure/admin/persistence.ts";

export function composeAdminFeature(arg: { readonly em: EntityManager }): TAdminFeature {
    return getAdminFeature(getAdminPersistence({ em: arg.em }));
}
