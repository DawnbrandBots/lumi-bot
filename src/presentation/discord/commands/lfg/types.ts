import type { TAdminFeature as AdminFeature } from "../../../../application/admin/types.ts";
import type { LfgFeature } from "../../../../lfg/feature.ts";

export type TLfgCommandArgs = {
    readonly lfgFeature: LfgFeature;
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig" | "getLfgRoleConfig" | "setLfgRoleLastPingedAt">;
};
