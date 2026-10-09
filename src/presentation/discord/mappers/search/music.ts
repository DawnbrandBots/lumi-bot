import { subtext } from "discord.js";
import type { IDisciple } from "../../../../domain/game/models/disciple.types.ts";
import type { IMusic } from "../../../../domain/game/models/music.types.ts";

function formatShadowMusicFor(shadowMusicFor: Iterable<IDisciple> | null | undefined, intro: string) {
    const shadowMusicForArray = shadowMusicFor && Array.from(shadowMusicFor);

    return shadowMusicForArray && shadowMusicForArray.length
        ? `${intro} ${Array.from(shadowMusicFor)
              .map((disciple) => disciple.name)
              .join(", ")}.`
        : null;
}

export default function mapMusicToMessage(music: IMusic) {
    const shadowMusicFor = formatShadowMusicFor(music.shadowMusicFor, "Music that plays in Moon Room for Shadow");
    const shadowResultsScreenMusicFor = formatShadowMusicFor(
        music.shadowResultsScreenMusicFor,
        "Music that plays on the battle results screen for Shadow",
    );

    const description = [
        music.url ? undefined : subtext("No known source media for this song :("),
        shadowMusicFor,
        shadowResultsScreenMusicFor,
    ]
        .filter((s) => s != null)
        .join("\n");

    return {
        reply: {
            embed: {
                title: music.name,
                description: description,
            },
        },
        followUps: music.url ? [{ content: subtext(music.url) }] : [],
    };
}
