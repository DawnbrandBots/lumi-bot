import { defineEntity, p } from "@mikro-orm/sqlite";

export const GuildConfigSchema = defineEntity({
    name: "GuildConfig",
    properties: {
        id: p.string().primary(),
        guild: p.string().unique(),
        channel: p.string().nullable().default(null),
    },
});

export class GuildConfig extends GuildConfigSchema.class { }
GuildConfigSchema.setClass(GuildConfig);
