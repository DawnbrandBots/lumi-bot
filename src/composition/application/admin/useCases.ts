import type { EntityManager } from "@mikro-orm/sqlite";
import { addLfgRole } from "../../../application/admin/addLfgRole.ts";
import { clearLfgChannel } from "../../../application/admin/clearLfgChannel.ts";
import { clearLfgRolePingCooldown } from "../../../application/admin/clearLfgRolePingCooldown.ts";
import { getGuildConfig } from "../../../application/admin/getGuildConfig.ts";
import { getLfgRoleConfig } from "../../../application/admin/getLfgRoleConfig.ts";
import { removeLfgRole } from "../../../application/admin/removeLfgRole.ts";
import { setLfgChannel } from "../../../application/admin/setLfgChannel.ts";
import { setLfgRoleLastPingedAt } from "../../../application/admin/setLfgRoleLastPingedAt.ts";
import { setLfgRolePingCooldown } from "../../../application/admin/setLfgRolePingCooldown.ts";
import type {
    TAddAdminLfgRole,
    TClearAdminLfgChannel,
    TClearAdminLfgRolePingCooldown,
    TGetAdminGuildConfig,
    TGetAdminLfgRoleConfig,
    TRemoveAdminLfgRole,
    TSetAdminLfgChannel,
    TSetAdminLfgRoleLastPingedAt,
    TSetAdminLfgRolePingCooldown,
} from "../../../application/admin/types.ts";
import { getAdminPersistence } from "../../../infrastructure/admin/persistence.ts";

export type TAdminUseCases = {
    readonly addLfgRole: TAddAdminLfgRole;
    readonly clearLfgChannel: TClearAdminLfgChannel;
    readonly clearLfgRolePingCooldown: TClearAdminLfgRolePingCooldown;
    readonly getGuildConfig: TGetAdminGuildConfig;
    readonly getLfgRoleConfig: TGetAdminLfgRoleConfig;
    readonly removeLfgRole: TRemoveAdminLfgRole;
    readonly setLfgChannel: TSetAdminLfgChannel;
    readonly setLfgRoleLastPingedAt: TSetAdminLfgRoleLastPingedAt;
    readonly setLfgRolePingCooldown: TSetAdminLfgRolePingCooldown;
};

export function composeAdminUseCases(arg: { readonly em: EntityManager }): TAdminUseCases {
    const persistence = getAdminPersistence({ em: arg.em });

    return {
        addLfgRole: (guild, role) => addLfgRole(persistence, guild, role),
        clearLfgChannel: (guild) => clearLfgChannel(persistence, guild),
        clearLfgRolePingCooldown: (guild) => clearLfgRolePingCooldown(persistence, guild),
        getGuildConfig: (guild) => getGuildConfig(persistence, guild),
        getLfgRoleConfig: (guild, role) => getLfgRoleConfig(persistence, guild, role),
        removeLfgRole: (guild, role) => removeLfgRole(persistence, guild, role),
        setLfgChannel: (guild, channel) => setLfgChannel(persistence, guild, channel),
        setLfgRoleLastPingedAt: (guild, role, date) => setLfgRoleLastPingedAt(persistence, guild, role, date),
        setLfgRolePingCooldown: (guild, minutes) => setLfgRolePingCooldown(persistence, guild, minutes),
    };
}
