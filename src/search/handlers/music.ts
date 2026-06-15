import { subtext } from "discord.js";
import { Music } from "../../game/models/music.ts";
import type { IMusic } from "../../game/types.ts";
import { SEARCH_MUSIC_HANDLE_NO_OFFICIAL_SOURCE_MEDIA } from "../constants.ts";
import type { ISearchHandler } from "../types.ts";

const musicSearchHandler: ISearchHandler<Music> = {
    class: Music,
    message: (music: IMusic) => {
        const shadowMusicForArray = music.shadowMusicFor && Array.from(music.shadowMusicFor);

        const shadowMusicFor =
            shadowMusicForArray && shadowMusicForArray.length
                ? {
                      name: "Shadow music for",
                      value: Array.from(music.shadowMusicFor)
                          .map((disciple) => disciple.name)
                          .join(", "),
                  }
                : null;

        const fields = [...(shadowMusicFor ? [shadowMusicFor] : [])];

        return {
            reply: {
                embed: {
                    title: music.name,
                    description: shadowMusicFor ? SEARCH_MUSIC_HANDLE_NO_OFFICIAL_SOURCE_MEDIA : undefined,
                    fields,
                },
            },
            followUps: music.url ? [{ content: subtext(music.url) }] : [],
        };
    },
} as const;

export default musicSearchHandler;
