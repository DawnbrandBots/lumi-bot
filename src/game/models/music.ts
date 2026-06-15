import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IMusic } from "../types.ts";
import { Disciple } from "./disciple.ts";

export const MusicSchema = defineEntity({
    name: "Music",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        url: p.string().nullable(),
        shadowMusicFor: () => p.oneToMany(Disciple).mappedBy("shadowMusic").nullable(),
    },
});

export class Music extends MusicSchema.class implements IMusic {
    public get kind() {
        return "music" as const;
    }
}
MusicSchema.setClass(Music);
