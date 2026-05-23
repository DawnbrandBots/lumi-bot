import { defineEntity, p } from "@mikro-orm/sqlite";
import { Room } from "./room.ts";

export const RoomPlayerSchema = defineEntity({
    name: "RoomPlayer",
    properties: {
        id: p.string().primary(),
        userId: p.string(),
        room: () => p.manyToOne(Room).inversedBy("players"),
        joinedAt: p.date().onCreate(() => new Date().toISOString()),
    },
});

export class RoomPlayer extends RoomPlayerSchema.class { }
RoomPlayerSchema.setClass(RoomPlayer);
