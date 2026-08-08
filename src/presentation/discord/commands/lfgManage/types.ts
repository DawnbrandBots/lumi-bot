import type { AdminFeature } from "../../../../admin/feature.ts";
import type { LfgFeature } from "../../../../lfg/feature.ts";

export type TLfgManageCommandArgs = {
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig">;
    readonly lfgFeature: LfgFeature;
};
