import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IMusic } from "../types.ts";

export const MusicSchema = defineEntity({
    name: "Music",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        url: p.string(),
    },
});

export class Music extends MusicSchema.class implements IMusic {
    public get kind() {
        return "music" as const;
    }
}
MusicSchema.setClass(Music);
