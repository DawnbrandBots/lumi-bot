import type { TAdminFeature as AdminFeature } from "../../../../application/admin/types.ts";
import type { TLfgFeature as LfgFeature } from "../../../../application/lfg/types.ts";

export type TLfgManageCommandArgs = {
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig">;
    readonly lfgFeature: LfgFeature;
};
