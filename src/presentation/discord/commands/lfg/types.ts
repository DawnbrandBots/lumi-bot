import type { AdminFeature } from "../../../../admin/feature.ts";
import type { LfgFeature } from "../../../../lfg/feature.ts";

export type TLfgCommandArgs = {
    readonly lfgFeature: LfgFeature;
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig" | "getLfgRoleConfig" | "setLfgRoleLastPingedAt">;
};
