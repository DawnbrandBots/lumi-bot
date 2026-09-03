import type { TId } from "./base.types.ts";
import type { IDisciple } from "./disciple.types.ts";

export interface IMusic {
    readonly kind: "music";
    readonly id: TId;
    readonly name: string;
    /** URL to media for this music. */
    readonly url?: string | null;
    /** Shadow disciples for which this song plays during battle. */
    readonly shadowMusicFor?: Iterable<IDisciple> | null;
    /** Shadow disciples for which this song plays on a battle's results screen. */
    readonly shadowResultsScreenMusicFor?: Iterable<IDisciple> | null;
}
