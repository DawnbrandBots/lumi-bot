import type { TAdminRepository } from "./admin/repositories.types.ts";
import type { TLfgRepository } from "./lfg/repositories.types.ts";

export type TApplicationRepositories = {
    readonly admin: TAdminRepository;
    readonly lfg: TLfgRepository;
};
