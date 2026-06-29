import { defineEntity, p } from "@mikro-orm/sqlite";
import { LfgRoomPlayer } from "./roomPlayer.ts";

export const LfgRoomSchema = defineEntity({
    name: "LfgRoom",
    properties: {
        id: p.string().primary(),
        guildId: p.string(),
        code: p.string(),
        ownerId: p.string(),
        players: () => p.oneToMany(LfgRoomPlayer).mappedBy("room"),
        createdAt: p.date().onCreate(() => new Date().toISOString()),
    },
});

export class LfgRoom extends LfgRoomSchema.class {}
LfgRoomSchema.setClass(LfgRoom);
