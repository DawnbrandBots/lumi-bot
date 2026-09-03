import type { TAdminUseCases } from "./admin/useCases.types.ts";
import type { TLfgUseCases } from "./lfg/useCases.types.ts";
import type { TSearchUseCases } from "./search/useCases.types.ts";

// TODO: leave files with single types like this?
// TODO: also is this the right layer for it?
export type TApplicationUseCases = {
    readonly admin: TAdminUseCases;
    readonly lfg: TLfgUseCases;
    readonly search: TSearchUseCases;
};
