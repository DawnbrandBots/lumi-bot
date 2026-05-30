import { defineEntity, p } from "@mikro-orm/sqlite";
import { RoomPlayer } from "./roomPlayer.ts";

export const RoomSchema = defineEntity({
    name: "Room",
    properties: {
        id: p.string().primary(),
        guildId: p.string(),
        code: p.string(),
        ownerId: p.string(),
        players: () => p.oneToMany(RoomPlayer).mappedBy("room"),
        createdAt: p.date().onCreate(() => new Date().toISOString()),
    },
});

export class Room extends RoomSchema.class {}
RoomSchema.setClass(Room);
