import { Collection } from "@mikro-orm/sqlite";
import type { TSearchSuccessValue } from "../../../../../../src/application/search/types.ts";
import type { Disciple } from "../../../../../../src/infrastructure/wrappers/orm/mikroOrm/models/game/disciple.ts";

export const MUSIC = {
    kind: "music",
    id: "TEST_MUSIC",
    name: "Test Music",
    url: null,
    // TODO: there's something wrong with the types if creating collections is required here
    shadowMusicFor: new Collection<Disciple>({}, []),
    shadowResultsScreenMusicFor: new Collection<Disciple>({}, []),
} as const;

export const MUSIC_SEARCH_SUCCESS_VALUE = {
    kind: "music",
    entity: MUSIC,
    searchItem: {
        id: MUSIC.id,
        kind: "music",
        name: MUSIC.name,
        aliases: [MUSIC.name],
    },
} satisfies TSearchSuccessValue<"music">;
