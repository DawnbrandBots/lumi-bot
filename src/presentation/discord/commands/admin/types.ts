import type { TAdminUseCases } from "../../../../application/admin/types.ts";

export type TAdminCommandArgs = Pick<
    TAdminUseCases,
    | "addLfgRole"
    | "clearLfgChannel"
    | "clearLfgRolePingCooldown"
    | "getGuildConfig"
    | "removeLfgRole"
    | "setLfgChannel"
    | "setLfgRolePingCooldown"
>;
