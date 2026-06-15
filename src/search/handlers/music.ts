import { subtext } from "discord.js";
import { Music } from "../../game/models/music.ts";
import type { IMusic } from "../../game/types.ts";
import type { ISearchHandler } from "../types.ts";

const musicSearchHandler: ISearchHandler<Music> = {
    class: Music,
    message: (music: IMusic) => ({
        reply: {
            embed: {
                title: music.name,
            },
        },
        followUps: music.url ? [{ content: subtext(music.url) }] : [],
    }),
} as const;

export default musicSearchHandler;
