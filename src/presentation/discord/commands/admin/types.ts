import type {
    TAddAdminLfgRole,
    TClearAdminLfgChannel,
    TClearAdminLfgRolePingCooldown,
    TGetAdminGuildConfig,
    TRemoveAdminLfgRole,
    TSetAdminLfgChannel,
    TSetAdminLfgRolePingCooldown,
} from "../../../../application/admin/types.ts";

export type TAdminCommandArgs = {
    readonly addLfgRole: TAddAdminLfgRole;
    readonly clearLfgChannel: TClearAdminLfgChannel;
    readonly clearLfgRolePingCooldown: TClearAdminLfgRolePingCooldown;
    readonly getGuildConfig: TGetAdminGuildConfig;
    readonly removeLfgRole: TRemoveAdminLfgRole;
    readonly setLfgChannel: TSetAdminLfgChannel;
    readonly setLfgRolePingCooldown: TSetAdminLfgRolePingCooldown;
};
