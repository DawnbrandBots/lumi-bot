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
    }),
} as const;

export default musicSearchHandler;
