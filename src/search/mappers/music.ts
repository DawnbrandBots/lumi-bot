import { subtext } from "discord.js";
import type { IDisciple, IMusic } from "../../game/types.ts";
import { SEARCH_MUSIC_HANDLE_NO_KNOWN_SOURCE_MEDIA } from "../constants.ts";

function formatShadowMusicFor(shadowMusicFor: Iterable<IDisciple> | null | undefined, name: string) {
    const shadowMusicForArray = shadowMusicFor && Array.from(shadowMusicFor);

    return shadowMusicForArray && shadowMusicForArray.length
        ? {
              name,
              value: Array.from(shadowMusicFor)
                  .map((disciple) => disciple.name)
                  .join(", "),
          }
        : null;
}

export default function mapMusicToMessage(music: IMusic) {
    const shadowMusicFor = formatShadowMusicFor(music.shadowMusicFor, "Shadow music for");
    const shadowResultsScreenMusicFor = formatShadowMusicFor(
        music.shadowResultsScreenMusicFor,
        "Shadow results screen music for",
    );

    const fields = [
        ...(shadowMusicFor ? [shadowMusicFor] : []),
        ...(shadowResultsScreenMusicFor ? [shadowResultsScreenMusicFor] : []),
    ];

    return {
        reply: {
            embed: {
                title: music.name,
                description: music.url ? undefined : SEARCH_MUSIC_HANDLE_NO_KNOWN_SOURCE_MEDIA,
                fields,
            },
        },
        followUps: music.url ? [{ content: subtext(music.url) }] : [],
    };
}
