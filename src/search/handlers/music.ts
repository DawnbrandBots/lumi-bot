import { Music } from "../../infrastructure/game/models/music.ts";
import type { ISearchConfig } from "../types.ts";

const musicSearchHandler: ISearchConfig<Music> = {
    class: Music,
} as const;

export default musicSearchHandler;
