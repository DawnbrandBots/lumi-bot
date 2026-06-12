import { defineEntity, p } from "@mikro-orm/sqlite";

export const LfgQueuePlayerSchema = defineEntity({
    name: "LfgQueuePlayer",
    properties: {
        id: p.string().primary(),
        userId: p.string(),
        guildId: p.string(),
        joinedAt: p.date().onCreate(() => new Date().toISOString()),
    },
});

export class LfgQueuePlayer extends LfgQueuePlayerSchema.class {}
LfgQueuePlayerSchema.setClass(LfgQueuePlayer);
