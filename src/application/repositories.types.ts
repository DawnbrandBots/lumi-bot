import type { TAdminRepository } from "./admin/repositories.types.ts";
import type { TBazaarRepository } from "./bazaar/repositories.types.ts";
import type { TLfgRepository } from "./lfg/repositories.types.ts";

export type TApplicationRepositories = {
    readonly admin: TAdminRepository;
    readonly bazaar: TBazaarRepository;
    readonly lfg: TLfgRepository;
};
