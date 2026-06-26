import { defineEntity, p } from "@mikro-orm/sqlite";
import { LfgRoom } from "./room.ts";

export const LfgRoomPlayerSchema = defineEntity({
    name: "LfgRoomPlayer",
    properties: {
        id: p.string().primary(),
        userId: p.string(),
        room: () => p.manyToOne(LfgRoom).inversedBy("players"),
        joinedAt: p.date().onCreate(() => new Date().toISOString()),
        lastActivityAt: p.date().onCreate(() => new Date().toISOString()),
        inactivityWarnedAt: p.date().nullable().default(null),
    },
});

export class LfgRoomPlayer extends LfgRoomPlayerSchema.class {}
LfgRoomPlayerSchema.setClass(LfgRoomPlayer);
