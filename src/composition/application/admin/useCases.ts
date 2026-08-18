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
import { getWithAdminUnitOfWork } from "./unitOfWork.ts";

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
    const withAdminUnitOfWork = getWithAdminUnitOfWork(arg.em);

    return {
        addLfgRole: withAdminUnitOfWork(addLfgRole),
        clearLfgChannel: withAdminUnitOfWork(clearLfgChannel),
        clearLfgRolePingCooldown: withAdminUnitOfWork(clearLfgRolePingCooldown),
        getGuildConfig: (guild) => getGuildConfig(persistence, guild),
        getLfgRoleConfig: (guild, role) => getLfgRoleConfig(persistence, guild, role),
        removeLfgRole: withAdminUnitOfWork(removeLfgRole),
        setLfgChannel: withAdminUnitOfWork(setLfgChannel),
        setLfgRoleLastPingedAt: withAdminUnitOfWork(setLfgRoleLastPingedAt),
        setLfgRolePingCooldown: withAdminUnitOfWork(setLfgRolePingCooldown),
    };
}
