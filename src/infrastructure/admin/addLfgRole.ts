import { randomUUID } from "node:crypto";
import type { TAdminPersistenceMap } from "./types.ts";
import { GuildConfigLfgRole } from "./models/configLfgRole.ts";
import { getOrCreateGuildConfigEntity } from "./getOrCreateGuildConfigEntity.ts";

export const addLfgRole: TAdminPersistenceMap["addLfgRole"] = async (context, arg) => {
    const config = await getOrCreateGuildConfigEntity(context, arg.guildId);
    const lfgRole = context.em.create(GuildConfigLfgRole, {
        id: randomUUID(),
        guildConfig: config,
        role: arg.roleId,
        lastPingedAt: null,
    });
    context.em.persist(lfgRole);
};
