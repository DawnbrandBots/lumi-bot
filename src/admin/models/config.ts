import { defineEntity, p } from "@mikro-orm/sqlite";

export const ConfigSchema = defineEntity({
    name: "Config",
    properties: {
        id: p.string().primary(),
        guild: p.string().unique(),
        channel: p.string().nullable().default(null),
    },
});

export class Config extends ConfigSchema.class { }
ConfigSchema.setClass(Config);
