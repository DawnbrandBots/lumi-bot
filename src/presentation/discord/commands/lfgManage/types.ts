import type { TAdminFeature as AdminFeature } from "../../../../application/admin/types.ts";
import type { LfgFeature } from "../../../../lfg/feature.ts";

export type TLfgManageCommandArgs = {
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig">;
    readonly lfgFeature: LfgFeature;
};
