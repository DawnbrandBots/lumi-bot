import { defineEntity, p } from "@mikro-orm/sqlite";
import { GuildConfigLfgRole } from "./configLfgRole.ts";

export const GuildConfigSchema = defineEntity({
    name: "GuildConfig",
    properties: {
        id: p.string().primary(),
        guild: p.string().unique(),
        lfgChannel: p.string().nullable().default(null),
        lfgRoles: () => p.oneToMany(GuildConfigLfgRole).mappedBy("guildConfig"),
        lfgRolePingCooldownMinutes: p.integer().nullable(),
    },
});

export class GuildConfig extends GuildConfigSchema.class {}
GuildConfigSchema.setClass(GuildConfig);
