import { defineEntity, p } from "@mikro-orm/sqlite";
import { GuildConfig } from "./config.ts";

export const GuildConfigLfgRoleSchema = defineEntity({
    name: "GuildConfigLfgRole",
    properties: {
        id: p.string().primary(),
        guildConfig: () => p.manyToOne(GuildConfig).inversedBy("lfgRoles"),
        role: p.string(),
        lastPingedAt: p.date().nullable().default(null),
    },
});

export class GuildConfigLfgRole extends GuildConfigLfgRoleSchema.class {}
GuildConfigLfgRoleSchema.setClass(GuildConfigLfgRole);
