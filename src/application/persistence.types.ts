import type { TAdminPersistence } from "./admin/persistence.types.ts";
import type { TLfgPersistence } from "./lfg/persistence.types.ts";
import type { TSearchPersistence } from "./search/persistence.types.ts";

export type TApplicationPersistence = {
    readonly admin: TAdminPersistence;
    readonly lfg: TLfgPersistence;
    readonly search: TSearchPersistence;
};
