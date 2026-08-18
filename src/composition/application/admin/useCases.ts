import type { EntityManager } from "@mikro-orm/sqlite";
import { addLfgRole } from "../../../application/admin/useCases/addLfgRole.ts";
import { clearLfgChannel } from "../../../application/admin/useCases/clearLfgChannel.ts";
import { clearLfgRolePingCooldown } from "../../../application/admin/useCases/clearLfgRolePingCooldown.ts";
import { getGuildConfig } from "../../../application/admin/useCases/getGuildConfig.ts";
import { getLfgRoleConfig } from "../../../application/admin/useCases/getLfgRoleConfig.ts";
import { removeLfgRole } from "../../../application/admin/useCases/removeLfgRole.ts";
import { setLfgChannel } from "../../../application/admin/useCases/setLfgChannel.ts";
import { setLfgRoleLastPingedAt } from "../../../application/admin/useCases/setLfgRoleLastPingedAt.ts";
import { setLfgRolePingCooldown } from "../../../application/admin/useCases/setLfgRolePingCooldown.ts";
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
